import { initTRPC, TRPCError } from "@trpc/server";
import { z } from "zod";
import type {
  ActivityItemResponse,
  ActivityItemsResponse,
  ActivityListResponse,
  ActivityStatusResponse,
  ApiResponse,
  CreateActivityRequest,
  CreateActivityResponse,
  RevealResponse
} from "@zk-asset-raffle/types";
import {
  randomString,
  shuffle,
  encryptAesEcb,
  decryptAesEcb,
  buildMerkle,
  hashLeaf
} from "@zk-asset-raffle/crypto";

export type AppContext = {
  prisma: any;
};

const t = initTRPC.context<AppContext>().create();

function prepareWinPool(totalItems: number, prizes: { wid: number; count: number }[]) {
  const winPool: number[] = [];
  for (const prize of prizes) {
    winPool.push(...Array(prize.count).fill(prize.wid));
  }
  winPool.push(...Array(totalItems - winPool.length).fill(0));
  return shuffle(winPool);
}

const createActivityInput = z.object({
  name: z.string().min(1),
  total_items: z.number().int().positive(),
  prizes: z.array(
    z.object({
      name: z.string().min(1),
      count: z.number().int().positive()
    })
  ),
  creator_address: z.string().optional().nullable()
});

export const appRouter = t.router({
  activity: t.router({
    create: t.procedure.input(createActivityInput).mutation(async ({ ctx, input }) => {
      const { name, total_items, prizes, creator_address } = input as CreateActivityRequest;

      const totalWinners = prizes.reduce((sum, prize) => sum + prize.count, 0);
      if (totalWinners > total_items) {
        return {
          status: "error",
          message: `Total prize count (${totalWinners}) exceeds total items (${total_items})`
        } satisfies ApiResponse;
      }

      const activityId = randomString(16);
      const key = randomString(32);
      const creatorAddress = (creator_address || "").toLowerCase() || null;

      const prizesWithWid = prizes.map((prize, idx) => ({
        ...prize,
        wid: idx + 1
      }));

      const nothingCount = total_items - totalWinners;
      if (nothingCount > 0) {
        prizesWithWid.unshift({ name: "nothing", count: nothingCount, wid: 0 });
      }

      const winPool = prepareWinPool(total_items, prizesWithWid);
      const items = [] as {
        sid: string;
        leaf: string;
        encryptedData: string;
        proof: string | null;
      }[];
      const leaves: string[] = [];

      for (let i = 0; i < total_items; i += 1) {
        const sid = randomString(16);
        const r_i = randomString(32);
        const win_i = winPool[i];
        const encryptedPayload = JSON.stringify({ r_i, win_i });
        const encryptedData = encryptAesEcb(key, encryptedPayload);
        const leaf = hashLeaf(sid, r_i, win_i);

        items.push({ sid, leaf, encryptedData, proof: null });
        leaves.push(leaf);
      }

      const { root, proofs } = buildMerkle(leaves);
      for (let i = 0; i < items.length; i += 1) {
        items[i].proof = JSON.stringify(proofs[i]);
      }

      await ctx.prisma.activity.create({
        data: {
          id: activityId,
          name,
          totalItems: total_items,
          key,
          merkleRoot: root,
          status: "sealed",
          creatorAddress,
          prizes: {
            create: {
              prizeConfig: JSON.stringify(prizesWithWid)
            }
          },
          items: {
            create: items.map((item) => ({
              sid: item.sid,
              leaf: item.leaf,
              encryptedData: item.encryptedData,
              proof: item.proof
            }))
          }
        }
      });

      return {
        status: "success",
        activity_id: activityId,
        key,
        prizes: prizesWithWid,
        merkle_root: root,
        creator_address: creatorAddress,
        message: `Activity created successfully with ${total_items} items`
      } satisfies CreateActivityResponse;
    }),

    list: t.procedure.query(async ({ ctx }) => {
      const activities = await ctx.prisma.activity.findMany({
        orderBy: { createdAt: "desc" },
        include: { prizes: true }
      });

      return {
        status: "success",
        activities: activities.map((activity: any) => {
          const prizeConfig = activity.prizes?.[0]?.prizeConfig;
          return {
            activity_id: activity.id,
            name: activity.name,
            total_items: activity.totalItems,
            status: activity.status,
            creator_address: activity.creatorAddress,
            created_at: activity.createdAt ? activity.createdAt.toISOString() : null,
            prizes: prizeConfig ? JSON.parse(prizeConfig) : []
          };
        })
      } satisfies ActivityListResponse;
    }),

    listByCreator: t.procedure
      .input(z.object({ address: z.string() }))
      .query(async ({ ctx, input }) => {
        const addr = (input.address || "").toLowerCase();
        const activities = await ctx.prisma.activity.findMany({
          where: { creatorAddress: addr },
          orderBy: { createdAt: "desc" },
          include: { prizes: true }
        });

        return {
          status: "success",
          activities: activities.map((activity: any) => {
            const prizeConfig = activity.prizes?.[0]?.prizeConfig;
            return {
              activity_id: activity.id,
              name: activity.name,
              total_items: activity.totalItems,
              status: activity.status,
              creator_address: activity.creatorAddress,
              created_at: activity.createdAt ? activity.createdAt.toISOString() : null,
              prizes: prizeConfig ? JSON.parse(prizeConfig) : []
            };
          })
        } satisfies ActivityListResponse;
      }),

    status: t.procedure
      .input(z.object({ activityId: z.string() }))
      .query(async ({ ctx, input }) => {
        const activity = await ctx.prisma.activity.findUnique({ where: { id: input.activityId } });
        if (!activity) {
          return { status: "error", message: "Activity not found" } satisfies ApiResponse;
        }
        return {
          status: "success",
          activity_id: activity.id,
          activity_status: activity.status
        } satisfies ActivityStatusResponse;
      }),

    items: t.procedure
      .input(z.object({ activityId: z.string() }))
      .query(async ({ ctx, input }) => {
        const activity = await ctx.prisma.activity.findUnique({ where: { id: input.activityId } });
        if (!activity) {
          return { status: "error", message: "Activity not found" } satisfies ApiResponse;
        }

        const items = await ctx.prisma.item.findMany({
          where: { activityId: input.activityId },
          orderBy: { id: "asc" }
        });

        return {
          status: "success",
          items: items.map((item: any) => ({
            sid: item.sid,
            r_i: item.r_i,
            win_i: item.win_i,
            leaf: item.leaf,
            proof: item.proof ? JSON.parse(item.proof) : null,
            encrypted_data: item.encryptedData
          }))
        } satisfies ActivityItemsResponse;
      }),

    itemBySid: t.procedure
      .input(z.object({ activityId: z.string(), sid: z.string() }))
      .query(async ({ ctx, input }) => {
        const item = await ctx.prisma.item.findFirst({
          where: { activityId: input.activityId, sid: input.sid }
        });

        if (!item) {
          return { status: "error", message: "Item not found" } satisfies ApiResponse;
        }

        return {
          status: "success",
          sid: item.sid,
          r_i: item.r_i,
          win_i: item.win_i,
          leaf: item.leaf,
          proof: item.proof ? JSON.parse(item.proof) : null
        } satisfies ActivityItemResponse;
      }),

    reveal: t.procedure
      .input(z.object({ activityId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const activity = await ctx.prisma.activity.findUnique({
          where: { id: input.activityId },
          include: { items: true }
        });

        if (!activity) {
          return { status: "error", message: "Activity not found" } satisfies ApiResponse;
        }

        const updates = [] as Promise<unknown>[];

        for (const item of activity.items) {
          if (item.r_i && item.win_i !== null) {
            continue;
          }

          try {
            const decrypted = decryptAesEcb(activity.key ?? "", item.encryptedData ?? "");
            let r_i = "";
            let win_i = 0;

            try {
              const parsed = JSON.parse(decrypted) as { r_i: string; win_i: number };
              r_i = parsed.r_i;
              win_i = parsed.win_i;
            } catch {
              r_i = decrypted.slice(0, 32);
              win_i = Number.parseInt(decrypted.slice(32), 10);
            }

            updates.push(
              ctx.prisma.item.update({
                where: { id: item.id },
                data: { r_i, win_i }
              })
            );
          } catch (error) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Failed to decrypt item"
            });
          }
        }

        updates.push(
          ctx.prisma.activity.update({
            where: { id: input.activityId },
            data: { status: "revealed" }
          })
        );

        await ctx.prisma.$transaction(updates);

        return {
          status: "success",
          activity_id: input.activityId,
          key: activity.key
        } satisfies RevealResponse;
      }),

    delete: t.procedure
      .input(z.object({ activityId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const activity = await ctx.prisma.activity.findUnique({ where: { id: input.activityId } });
        if (!activity) {
          return { status: "error", message: "Activity not found" } satisfies ApiResponse;
        }

        await ctx.prisma.$transaction([
          ctx.prisma.item.deleteMany({ where: { activityId: input.activityId } }),
          ctx.prisma.prize.deleteMany({ where: { activityId: input.activityId } }),
          ctx.prisma.activity.delete({ where: { id: input.activityId } })
        ]);

        return {
          status: "success",
          message: `Activity ${input.activityId} deleted`
        } satisfies ApiResponse;
      })
  })
});

export type AppRouter = typeof appRouter;
