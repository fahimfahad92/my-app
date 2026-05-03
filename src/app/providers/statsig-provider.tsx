"use client";

import {StatsigProvider, StatsigUser} from "@statsig/react-bindings";
import {StatsigAutoCapturePlugin} from '@statsig/web-analytics';
import {ReactNode, useEffect, useState} from "react";

import {getBrowserUserId, getBrowserUserInfo} from "../_lib/statsig-util";
import {logger} from "@/app/util/logger";

export default function StatsigProviderWrapper({children}: {children: ReactNode}) {

    const [user, setUser] = useState<StatsigUser | null>(null);

    useEffect(() => {

        const deviceInfo = getBrowserUserInfo();
        const userId = getBrowserUserId();

        const newUser: StatsigUser = {
            userID: userId,
            custom: deviceInfo as StatsigUser["custom"],
        };

        logger.log("Statsig user:", newUser);

        setUser(newUser);

    }, []);

    if (!user) return null;

    return (
        <StatsigProvider
            sdkKey={process.env.NEXT_PUBLIC_STATSIG_CLIENT_KEY!}
            user={user}
            options={{plugins: [new StatsigAutoCapturePlugin()]}}
        >
            {children}
        </StatsigProvider>
    );
}
