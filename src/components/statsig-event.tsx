import {useStatsigClient} from "@statsig/react-bindings";
import {useCallback} from "react";
import {logger} from "@/app/util/logger";

export interface EventMetadata {
  [key: string]: string;
}

export function useStatsigEvents() {
    const {client} = useStatsigClient();

    const logEvent = useCallback((eventName: string, metadata: EventMetadata) => {
        if (!client) return;
        logger.log("Logging event: ", eventName);
        client.logEvent(eventName, undefined, metadata);
    }, [client]);

    return {logEvent};
}
