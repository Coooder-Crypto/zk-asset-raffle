# 创建 RWA QRCode
- POST http://127.0.0.1:5000/api/activity/create
```json
{
    "name": "Test Lottery01",
    "total_items": 5,
    "prizes": [
        {"name": "first prize", "count": 1},
        {"name": "second prize", "count": 1},
        {"name": "third prize", "count": 1}
    ]
}
```
Example Response:
```json
{
    "activity_id": "4eiIVcvg7EqTLXXg",
    "key": "1Pgb5InHITBqQqMpPze22qkQFQgGhzpG",
    "merkle_root": "16636e9afff5c5ad5179824606fbcb36d4a0c1943091ea07c374de23c7dc0adc",
    "prizes": [
        {
            "count": 2,
            "name": "nothing",
            "wid": 0
        },
        {
            "count": 1,
            "name": "first prize",
            "wid": 1
        },
        {
            "count": 1,
            "name": "second prize",
            "wid": 2
        },
        {
            "count": 1,
            "name": "third prize",
            "wid": 3
        }
    ],
    "status": "success"
}
```
# 查看当前所有活动
- GET http://127.0.0.1:5000/api/activities
```json
{
    "activities": [
        {
            "activity_id": "lnPClp0yuUJeqnOF",
            "name": "Test Lottery01",
            "prizes": [
                {
                    "count": 2,
                    "name": "nothing",
                    "wid": 0
                },
                {
                    "count": 1,
                    "name": "first prize",
                    "wid": 1
                },
                {
                    "count": 1,
                    "name": "second prize",
                    "wid": 2
                },
                {
                    "count": 1,
                    "name": "third prize",
                    "wid": 3 // 编号
                }
            ],
            "status": "sealed",
            "total_items": 5
        },
        {
            "activity_id": "4eiIVcvg7EqTLXXg",
            "name": "Test Lottery01",
            "prizes": [
                {
                    "count": 2,
                    "name": "nothing",
                    "wid": 0
                },
                {
                    "count": 1,
                    "name": "first prize",
                    "wid": 1
                },
                {
                    "count": 1,
                    "name": "second prize",
                    "wid": 2
                },
                {
                    "count": 1,
                    "name": "third prize",
                    "wid": 3
                }
            ],
            "status": "sealed",
            "total_items": 5
        }
    ],
    "status": "success"
}
```

# 查看指定活动的状态
- http://127.0.0.1:5000/api/activity/lnPClp0yuUJeqnOF/status
- 传 "activity_id": "4eiIVcvg7EqTLXXg"

```json
{
    "activity_id": "lnPClp0yuUJeqnOF",
    "activity_status": "sealed",
    "status": "success"
}
```

# 查看指定活动的所有物品
- http://127.0.0.1:5000/api/activity/4eiIVcvg7EqTLXXg/items
- "r_i": null, "win_i": null 是敏感信息
- "sid": "C92DqHGoq2w89n3c", 和 "encrypted_data": "VjhHgiwNZGYH+Fo3MRdmFCIDd8r2TF8rXCfc0MuBB6vE6ptjLNArFPFqLBxkucQp", 一起作为构建QRCode的元数据
```json
{
    "items": [
        {
            "encrypted_data": "VjhHgiwNZGYH+Fo3MRdmFCIDd8r2TF8rXCfc0MuBB6vE6ptjLNArFPFqLBxkucQp",
            "leaf": "520c5f6c2a2350ed2dd0c2aff9ec88ca7eb0fa7b0688ed7cefa1aaa833e183ec",
            "proof": [
                {
                    "data": "2035a00921dc453bf2c14642d53187f79297cfcf852148b39c79f5344c15a28b",
                    "position": "right"
                },
                {
                    "data": "2fcd590968ed16922bc6b813c0ad9ab12352ddeb4fd5a05c73b618da8d2190c0",
                    "position": "right"
                },
                {
                    "data": "8e72a83b66df1f9a05592e26e5ed92bc381f07e3dd6b9cc8706aa67e906eeb6f",
                    "position": "right"
                }
            ],
            "r_i": null,
            "sid": "C92DqHGoq2w89n3c",
            "win_i": null
        },
        {
            "encrypted_data": "Ecta5lkXSjBYFTeXxfguWg0HjXtkpFofTDwdFCJpu6DYGti/P6HvBjk0RZe6rUlP",
            "leaf": "b69ac56723bc8b8cede3f4b6614cfafac82fa65f7943f3cea43825d48c9522be",
            "proof": [
                {
                    "data": "668bdec8b404a55fd8f20e11d53acb0262c69f2adf5bdbf70f7302fed64a75d8",
                    "position": "left"
                },
                {
                    "data": "2fcd590968ed16922bc6b813c0ad9ab12352ddeb4fd5a05c73b618da8d2190c0",
                    "position": "right"
                },
                {
                    "data": "8e72a83b66df1f9a05592e26e5ed92bc381f07e3dd6b9cc8706aa67e906eeb6f",
                    "position": "right"
                }
            ],
            "r_i": null,
            "sid": "L9V3UukSuaL0k98U",
            "win_i": null
        },
        {
            "encrypted_data": "Z9L2bfKVqhTN8cszaNmwU95qhwnitXxN6BZ/OzkFJwuOlcPKwd2K0NA7f05ph4iP",
            "leaf": "77a551052402a89f11d54cac7b05ae3b1a9d74f7bd815451d7a32fb54642c96d",
            "proof": [
                {
                    "data": "d0d1ca9785fc02c2b71f53545b5a562597bb42dc6c568746c923dbfa65c77d21",
                    "position": "right"
                },
                {
                    "data": "07b9da874950e98704fa62705e49b9336497f85034bcc1027aaae3b30804bed5",
                    "position": "left"
                },
                {
                    "data": "8e72a83b66df1f9a05592e26e5ed92bc381f07e3dd6b9cc8706aa67e906eeb6f",
                    "position": "right"
                }
            ],
            "r_i": null,
            "sid": "9XX4xXaz9KT0X7ZA",
            "win_i": null
        },
        {
            "encrypted_data": "r3Zp4eXym+L8CUUsIjuNBMvnkMkj/uzO46CFCQRhOLiOlcPKwd2K0NA7f05ph4iP",
            "leaf": "b71d915843e7fb438deedbe2a4f0ba29050948d933b5d9dbfb16c33c438e95f3",
            "proof": [
                {
                    "data": "5799e3b1faf310f7fc6b41cc0a277cc95bee5827320592dd7b0704d7df4a7716",
                    "position": "left"
                },
                {
                    "data": "07b9da874950e98704fa62705e49b9336497f85034bcc1027aaae3b30804bed5",
                    "position": "left"
                },
                {
                    "data": "8e72a83b66df1f9a05592e26e5ed92bc381f07e3dd6b9cc8706aa67e906eeb6f",
                    "position": "right"
                }
            ],
            "r_i": null,
            "sid": "PyHwZqhfSvsEVouV",
            "win_i": null
        },
        {
            "encrypted_data": "x6CjDPf+Ww0YbSnFtcYjRFMpFKvS8m76fCVHqsLFrwSes5eaJ83I8mTquTkHXx2z",
            "leaf": "77934b4a215c8db4a6a7f21c1a0474b4a594efdf542b48c8260edb2cd5e731cd",
            "proof": [
                {
                    "data": "08c417cf13576f1071afbdd1d9bdf0b7a84a4759574f8fc38afa3ccb0913902a",
                    "position": "left"
                }
            ],
            "r_i": null,
            "sid": "gqrfIA2iY3Tqse9j",
            "win_i": null
        }
    ],
    "status": "success"
}
```

# 揭开承诺
- http://127.0.0.1:5000/api/activity/4eiIVcvg7EqTLXXg/reveal
```
{
    "activity_id": "4eiIVcvg7EqTLXXg",
    "key": "1Pgb5InHITBqQqMpPze22qkQFQgGhzpG",
    "status": "success"
}
```

对应的 activity 将解密。这时再调用：GET http://127.0.0.1:5000/api/activities 会发现活动变为了 revealed。