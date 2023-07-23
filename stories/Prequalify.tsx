import React from 'react';
import { prequalify } from '../src';
import { EnvironmentType } from '../src/initialize';

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
  firstName,
  apiKey,
  env = 'production',
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
              },
            },
            consumerDetails: {
              firstName,
            },
            onModalOpen: () => {
              console.log('##############opened###########');
            },
          });
        } catch (e) {
          console.error(e);
        }
      }}
    >
      Launch ChargeAfter modal
    </button>
  );
};
