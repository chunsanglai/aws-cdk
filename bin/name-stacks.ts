import variables from './load-dotenv';

/**
 * Name your stacks with a consistent naming convention.
 *
 * Usage example:
    const vpcStack = new VpcStack(this, stackName('skeletonVpc'), {});
 */
export default function stackName(identifier: string): string {
  return `${variables.CUSTOMER_NAME}-${identifier}`;
};
