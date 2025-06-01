"use client";
// app/components/Pagination.jsx
import React, { useMemo } from "react";

const Pagination = ({ currentPage, pageSize, totalItems, onPageChange }) => {
  const totalPages = Math.ceil(totalItems / pageSize);

  const pageNumbers = useMemo(() => {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }, [totalPages]);

  const handlePrevClick = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextClick = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <>
      {" "}
      <div className="mt-4 flex justify-center">
        <ul className="flex space-x-2">
          <li>
            <button onClick={handlePrevClick} disabled={currentPage === 1}>
              Prev
            </button>
          </li>
          {pageNumbers.map((page) => (
            <li key={page}>
              <button
                onClick={() => onPageChange(page)}
                className={currentPage === page ? "font-bold" : ""}
              >
                {page}
              </button>
            </li>
          ))}
          <li>
            <button
              onClick={handleNextClick}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </li>
        </ul>
      </div>
    </>
  );
};

export default Pagination;
