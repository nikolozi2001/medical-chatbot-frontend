const InputForm = ({ value, setValue, getResponse, error, loading }) => {
  return (
    <div className="input-container">
      <input
        value={value}
        placeholder="ჩაწერეთ შეკითხვა..."
        onChange={(e) => setValue(e.target.value)}
        className="input-field"
      />
      {!error && !loading && (
        <button onClick={getResponse} className="submit-button">
          მკითხე
        </button>
      )}
      {loading && <p>დაელოდეთ...</p>}
    </div>
  );
};

export default InputForm;