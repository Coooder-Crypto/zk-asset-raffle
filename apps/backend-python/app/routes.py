import json
from flask import Blueprint, request, jsonify
from . import db
from .models import Activity, Prize, Item
from .utils import generate_activity_id, generate_random_string, encrypt, decrypt
from eth_hash.auto import keccak as keccak256
import random

api = Blueprint('api', __name__)

def _prepare_win_pool(total_items, prizes):
    win_pool = []
    for p in prizes:
        win_pool.extend([p['wid']] * p['count'])
    win_pool.extend([0] * (total_items - len(win_pool)))
    random.shuffle(win_pool)
    return win_pool

class MerkleTree:
    def __init__(self, leaves):
        # 规范化所有叶子节点为 bytes32（不再次 keccak）
        # 前端/上链 leaf 已是 keccak256(sid||r_i||win_i) 的十六进制字符串
        self.leaves = []
        for leaf in leaves:
            if isinstance(leaf, bytes):
                self.leaves.append(leaf)
            elif isinstance(leaf, str):
                s = leaf[2:] if leaf.startswith('0x') else leaf
                try:
                    self.leaves.append(bytes.fromhex(s))
                except Exception:
                    # 回退：按 utf-8 编码（不推荐，仅为兼容极端输入）
                    self.leaves.append(leaf.encode('utf-8'))
            else:
                self.leaves.append(str(leaf).encode('utf-8'))
        
        # 构建树
        self.layers = [self.leaves]
        self._build_tree()
        
    def _build_tree(self):
        current_layer = self.leaves
        
        # 当前层只有一个节点（根节点）时停止
        while len(current_layer) > 1:
            next_layer = []
            
            # 处理当前层的每对节点
            for i in range(0, len(current_layer), 2):
                # 如果是最后一个节点且没有配对，直接复制
                if i + 1 == len(current_layer):
                    next_layer.append(current_layer[i])
                else:
                    # OpenZeppelin MerkleProof 假定 pair 排序（lexicographic）
                    a = current_layer[i]
                    b = current_layer[i + 1]
                    combined = a + b if a <= b else b + a
                    next_hash = keccak256(combined)
                    next_layer.append(next_hash)
            
            # 将新层添加到层列表
            self.layers.append(next_layer)
            current_layer = next_layer
            
    @property
    def root(self):
        # 返回根节点哈希值
        return self.layers[-1][0]
    
    def get_proof(self, index):
        if index < 0 or index >= len(self.leaves):
            raise ValueError("Leaf index out of range")
        
        proof = []
        for layer_idx, layer in enumerate(self.layers[:-1]):  # 除了根层
            is_right_node = index % 2 == 1
            pair_idx = index - 1 if is_right_node else index + 1
            
            if pair_idx < len(layer):
                proof.append({
                    'position': 'left' if is_right_node else 'right',
                    'data': layer[pair_idx]
                })
            
            # 为下一层更新索引
            index = index // 2
        
        return proof

def calculate_merkle_tree(leaves):
    mtree = MerkleTree(leaves)
    merkle_root = mtree.root.hex()
    
    proofs = []
    for i in range(len(leaves)):
        proof = mtree.get_proof(i)
        # 将每个证明中的哈希值转换为十六进制字符串格式
        formatted_proof = []
        for p in proof:
            formatted_proof.append({
                'position': p['position'],
                'data': p['data'].hex()
            })
        proofs.append(formatted_proof)
    
    return merkle_root, proofs

def generate_merkle_tree_and_proofs(activity_id, total_items, prizes, key):
    win_pool = _prepare_win_pool(total_items, prizes)

    leaves = []
    items = []
    for i in range(total_items):
        sid = generate_random_string(16)
        r_i = generate_random_string(32)
        win_i = win_pool[i]

        # Use JSON format for encrypted data to avoid parsing issues
        encrypted_payload = json.dumps({'r_i': r_i, 'win_i': win_i})
        C_i = encrypt(key, encrypted_payload)
        
        # Calculate leaf hash in a format compatible with smart contract
        # Smart contract expects: keccak256(abi.encodePacked(sidStr, r_i, Strings.toString(win_i)))
        leaf = keccak256(f'{sid}{r_i}{win_i}'.encode()).hex()

        item = Item(activity_id=activity_id, sid=sid, leaf=leaf, encrypted_data=C_i)
        # Store r_i and win_i as None initially (will be populated during reveal)
        # item = Item(activity_id=activity_id, sid=sid, leaf=leaf, encrypted_data=C_i, r_i=r_i, win_i=win_i)

        db.session.add(item)
        leaves.append(leaf)
        items.append(item)

    merkle_root, proofs = calculate_merkle_tree(leaves)
    for item, proof in zip(items, proofs):
        print(f"Item ID: {item.id}, Proof: {proof}")
        item.proof = json.dumps(proof)
        db.session.add(item)

    Activity.query.filter_by(id=activity_id).update({
        'merkle_root': merkle_root,
        'status': 'sealed'
    })
    db.session.commit()

    return merkle_root

@api.route('/activity/create', methods=['POST'])
def create_activity():
    try:
        data = request.json
        
        # Validate required fields
        if not data or 'name' not in data or 'total_items' not in data or 'prizes' not in data:
            return jsonify({'status': 'error', 'message': 'Missing required fields: name, total_items, prizes'}), 400
        
        if not isinstance(data['total_items'], int) or data['total_items'] <= 0:
            return jsonify({'status': 'error', 'message': 'total_items must be a positive integer'}), 400
        
        if not isinstance(data['prizes'], list) or len(data['prizes']) == 0:
            return jsonify({'status': 'error', 'message': 'prizes must be a non-empty list'}), 400
        
        # Validate prizes format
        for prize in data['prizes']:
            if not isinstance(prize, dict) or 'name' not in prize or 'count' not in prize:
                return jsonify({'status': 'error', 'message': 'Each prize must have name and count fields'}), 400
            if not isinstance(prize['count'], int) or prize['count'] <= 0:
                return jsonify({'status': 'error', 'message': 'Prize count must be a positive integer'}), 400
        
        activity_id = generate_activity_id()
        key = generate_random_string(32)
        creator_address = (data.get('creator_address') or '').lower() or None
        activity = Activity(
            id=activity_id,
            name=data['name'],
            total_items=data['total_items'],
            key=key,
            status='pending',
            creator_address=creator_address,
        )

        prizes = data['prizes']
        total_winners = sum([prize['count'] for prize in prizes])
        
        # Check if total winners exceed total items
        if total_winners > data['total_items']:
            return jsonify({
                'status': 'error', 
                'message': f'Total prize count ({total_winners}) exceeds total items ({data["total_items"]})'}
            ), 400
        
        prizes_with_wid = []
        for wid, prize in enumerate(prizes, start=1):
            prize_copy = prize.copy()  # Don't modify original data
            prize_copy['wid'] = wid
            prizes_with_wid.append(prize_copy)

        nothing_count = data['total_items'] - total_winners
        if nothing_count > 0:
            prizes_with_wid.insert(0, {"name": "nothing", "count": nothing_count, "wid": 0})

        prize_config = json.dumps(prizes_with_wid)
        prize = Prize(activity_id=activity_id, prize_config=prize_config)

        db.session.add(activity)
        db.session.add(prize)
        db.session.commit()

        merkle_root = generate_merkle_tree_and_proofs(activity_id, data['total_items'], prizes_with_wid, key)
        return jsonify({
            'status': 'success', 
            'activity_id': activity_id, 
            'key': key, 
            'prizes': prizes_with_wid, 
            'merkle_root': merkle_root,
            'creator_address': creator_address,
            'message': f'Activity created successfully with {data["total_items"]} items'
        })
    
    except Exception as e:
        return jsonify({'status': 'error', 'message': f'Internal server error: {str(e)}'}), 500

@api.route('/activities', methods=['GET'])
def list_activities():
    activities = Activity.query.all()
    result = []

    for activity in activities:
        prize = Prize.query.filter_by(activity_id=activity.id).first()
        result.append({
            'activity_id': activity.id,
            'name': activity.name,
            'total_items': activity.total_items,
            'status': activity.status,
            'creator_address': activity.creator_address,
            'created_at': activity.created_at.isoformat() if activity.created_at else None,
            'prizes': json.loads(prize.prize_config) if prize else []
        })

    return jsonify({'status': 'success', 'activities': result})

@api.route('/activities/by-creator/<string:address>', methods=['GET'])
def list_activities_by_creator(address):
    addr = (address or '').lower()
    activities = Activity.query.filter_by(creator_address=addr).all()
    result = []
    for activity in activities:
        prize = Prize.query.filter_by(activity_id=activity.id).first()
        result.append({
            'activity_id': activity.id,
            'name': activity.name,
            'total_items': activity.total_items,
            'status': activity.status,
            'creator_address': activity.creator_address,
            'created_at': activity.created_at.isoformat() if activity.created_at else None,
            'prizes': json.loads(prize.prize_config) if prize else []
        })
    return jsonify({'status': 'success', 'activities': result})

@api.route('/activity/<string:activity_id>/status', methods=['GET'])
def get_activity_status(activity_id):
    activity = Activity.query.filter_by(id=activity_id).first()
    if not activity:
        return jsonify({'status': 'error', 'message': 'Activity not found'}), 404

    return jsonify({'status': 'success', 'activity_id': activity.id, 'activity_status': activity.status})

@api.route('/activity/<string:activity_id>/items', methods=['GET'])
def get_activity_items(activity_id):
    activity = Activity.query.filter_by(id=activity_id).first()
    if not activity:
        return jsonify({'status': 'error', 'message': 'Activity not found'}), 404

    items = Item.query.filter_by(activity_id=activity.id).all()
    result = []

    for item in items:
        result.append({
            'sid': item.sid,
            'r_i': item.r_i,
            'win_i': item.win_i,
            'leaf': item.leaf,
            'proof': json.loads(item.proof) if item.proof else None,
            'encrypted_data': item.encrypted_data
        })

    return jsonify({'status': 'success', 'items': result})

@api.route('/activity/<string:activity_id>/prizes', methods=['GET'])
def get_activity_prizes(activity_id):
    activity = Activity.query.filter_by(id=activity_id).first()
    if not activity:
        return jsonify({'status': 'error', 'message': 'Activity not found'}), 404

    prize = Prize.query.filter_by(activity_id=activity.id).first()
    if not prize:
        return jsonify({'status': 'error', 'message': 'No prizes found for this activity'}), 404

    prizes = json.loads(prize.prize_config)
    return jsonify({'status': 'success', 'prizes': prizes})

@api.route('/activity/<string:activity_id>/items/<string:sid>', methods=['GET'])
def get_item_by_sid(activity_id, sid):
    item = Item.query.filter_by(activity_id=activity_id, sid=sid).first()
    if not item:
        return jsonify({'status': 'error', 'message': 'Item not found'}), 404

    return jsonify({
        'status': 'success',
        'sid': item.sid,
        'r_i': item.r_i,
        'win_i': item.win_i,
        'leaf': item.leaf,
        'proof': json.loads(item.proof) if item.proof else None
    })

@api.route('/activity/<string:activity_id>/reveal', methods=['POST'])
def reveal_activity_key(activity_id):
    activity = Activity.query.filter_by(id=activity_id).first()
    if not activity:
        return jsonify({'status': 'error', 'message': 'Activity not found'}), 404

    key = activity.key

    items = Item.query.filter_by(activity_id=activity_id).all()

    for item in items:
        if item.r_i and item.win_i is not None:
            continue 
        
        # Decrypt the JSON-formatted data
        decrypted_data = decrypt(key, item.encrypted_data)
        try:
            # Parse JSON to get r_i and win_i
            data_dict = json.loads(decrypted_data)
            r_i = data_dict['r_i']
            win_i = data_dict['win_i']
        except (json.JSONDecodeError, KeyError):
            # Fallback to old format for backwards compatibility
            r_i, win_i = decrypted_data[:32], int(decrypted_data[32:])

        item.r_i = r_i
        item.win_i = win_i
        db.session.add(item)

    activity.status = 'revealed'
    db.session.add(activity)
    db.session.commit()

    return jsonify({'status': 'success', 'activity_id': activity_id, 'key': key})

@api.route('/activity/<string:activity_id>', methods=['DELETE'])
def delete_activity(activity_id):
    """Delete an activity and all its related records (items, prizes).
    Note: This only removes backend records and does not affect on-chain contracts.
    """
    activity = Activity.query.filter_by(id=activity_id).first()
    if not activity:
        return jsonify({'status': 'error', 'message': 'Activity not found'}), 404

    try:
        # Delete dependent rows first
        Item.query.filter_by(activity_id=activity_id).delete()
        Prize.query.filter_by(activity_id=activity_id).delete()
        Activity.query.filter_by(id=activity_id).delete()
        db.session.commit()
        return jsonify({'status': 'success', 'message': f'Activity {activity_id} deleted'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': f'Failed to delete activity: {str(e)}'}), 500
