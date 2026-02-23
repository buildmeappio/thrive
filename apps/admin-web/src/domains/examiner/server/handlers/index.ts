export { listRecentExaminers } from "./listRecentExaminers";
export { getExaminerCount } from "./getExaminerCount";

// Default export for convenience
const handlers = {
  listRecentExaminers: async (limit = 7) => {
    const { listRecentExaminers: handler } =
      await import("./listRecentExaminers");
    return handler(limit);
  },
  getExaminerCount: async () => {
    const { getExaminerCount: handler } = await import("./getExaminerCount");
    return handler();
  },
};

export default handlers;
