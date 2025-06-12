import React from "react";

const SubmitButton = ({ loading, text }) => (
  <button
    type="submit"
    disabled={loading}
    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
  >
    {loading ? `${text}...` : text}
  </button>
);

export default SubmitButton;
