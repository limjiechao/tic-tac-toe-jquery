// Introduce slight delay to allow winning grid cell to be rendered before showing alert
export const delay = async (duration: number) => {
  await new Promise((resolve) => setTimeout(resolve, duration));
};

// Thin wrapper over `Error` just to indicate these are expected
export class Guard extends Error {
  constructor(message: string) {
    super(message);
    super.name = 'Guard';
  }
}
