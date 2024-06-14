/* eslint-disable @typescript-eslint/no-misused-promises */
import type { BaseSyncer } from "@blobscan/syncers";
import {
  DailyStatsSyncer,
  OverallStatsSyncer,
  SwarmStampSyncer,
  createRedisConnection,
} from "@blobscan/syncers";

import { env } from "./env";
import { logger } from "./logger";
import { getNetworkDencunForkSlot } from "./utils";

export function setUpSyncers() {
  const connection = createRedisConnection(env.REDIS_URI);
  const syncers: BaseSyncer[] = [];

  if (env.SWARM_STORAGE_ENABLED) {
    if (!env.SWARM_BATCH_ID) {
      logger.warn(`Swarm stamp syncer not created: no batch ID provided`);
    } else if (!env.BEE_ENDPOINT) {
      logger.warn("Swarm stamp syncer not created: no Bee endpoint provided");
    } else {
      syncers.push(
        new SwarmStampSyncer({
          cronPattern: env.SYNCER_SWARM_STAMP_CRON_PATTERN,
          redisUriOrConnection: connection,
          batchId: env.SWARM_BATCH_ID,
          beeEndpoint: env.BEE_ENDPOINT,
        })
      );
    }
  }

  syncers.push(
    new DailyStatsSyncer({
      cronPattern: env.STATS_SYNCER_DAILY_CRON_PATTERN,
      redisUriOrConnection: connection,
    })
  );

  syncers.push(
    new OverallStatsSyncer({
      cronPattern: env.STATS_SYNCER_OVERALL_CRON_PATTERN,
      redisUriOrConnection: connection,
      lowestSlot:
        env.DENCUN_FORK_SLOT ?? getNetworkDencunForkSlot(env.NETWORK_NAME),
    })
  );

  Promise.all(syncers.map((syncer) => syncer.start()));

  return () => {
    let teardownPromise = Promise.resolve();

    for (const syncer of syncers) {
      teardownPromise = teardownPromise.finally(() => syncer.close());
    }

    return teardownPromise;
  };
}
