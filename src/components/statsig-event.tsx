import {useStatsigClient} from "@statsig/react-bindings";
import {useCallback} from "react";
import {logger} from "@/app/util/logger";

export type EventMetadata = Record<string, string | undefined>;

export function useStatsigEvents() {
    const {client} = useStatsigClient();

    const logEvent = useCallback((eventName: string, metadata: EventMetadata) => {
        if (!client) return;
        logger.log("Logging event: ", eventName);
        const cleaned: Record<string, string> = {};
        for (const [k, v] of Object.entries(metadata)) {
            if (v !== undefined) cleaned[k] = v;
        }
        client.logEvent(eventName, undefined, cleaned);
    }, [client]);

    return {logEvent};
}
