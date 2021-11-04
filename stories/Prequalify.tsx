import React from 'react';
import { EnvironmentType, prequalify } from "../dist";

interface ButtonProps {

    firstName?: string;

    /**
     * Public API key
     */
    apiKey: string;

    /**
     * Environment to work with
     */
    env?: EnvironmentType;
}

/**
 * Primary UI component for user interaction
 */
export const Button = ({
    // primary = false,
    // size = 'medium',
    // backgroundColor,
    // label,
    firstName,
    apiKey,
    env = "production",
    ...props
}: ButtonProps) => {

    return (
        <button
            type="button"
            {...props}
            onClick={async () => {
                try {
                    await prequalify({
                        config: {
                            env: {
                                name: env,
                                apiKey: apiKey,
                            }
                        },
                        consumerDetails: {
                            firstName
                        }
                    });
                } catch (e) {
                    console.error(e);
                }
            }}
        >Launch ChargeAfter modal</button >
    );
};
