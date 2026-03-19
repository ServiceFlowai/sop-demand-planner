import React, { memo } from 'react';

export interface HelloWorldProps {
  /**
   * Customizable greeting message displayed inside the component.
   * Defaults to "Hello, world!" when not provided.
   */
  message?: string;
}

/**
 * Renders a simple greeting message.
 */
const HelloWorld: React.FC<HelloWorldProps> = memo(({ message = 'Hello, world!' }) => {
  return <span>{message}</span>;
});

HelloWorld.displayName = 'HelloWorld';

export default HelloWorld;
