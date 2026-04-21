// src/utils/pagination.js



export function getPaginationParams(query) {
  let page     = parseInt(query.page     || '1',  10);
  let pageSize = parseInt(query.pageSize || '20', 10);

  // Sanitize inputs — never trust client-provided pagination values
  if (isNaN(page)     || page < 1)      page     = 1;
  if (isNaN(pageSize) || pageSize < 1)  pageSize = 20;
  if (pageSize > 50)                    pageSize = 50; // Hard cap — protect DB from huge scans

  return { page, pageSize, offset: (page - 1) * pageSize };
}

