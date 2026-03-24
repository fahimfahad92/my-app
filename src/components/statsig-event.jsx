import {useStatsigClient} from "@statsig/react-bindings";
import {useCallback} from "react";

export function useStatsigEvents() {
    const {client} = useStatsigClient();

    const logEvent = useCallback((eventName, metadata) => {
        if (!client) return;
        console.log("Logging event: ", eventName);
        client.logEvent(eventName, null, metadata);
    }, [client]);

    return {logEvent};
}