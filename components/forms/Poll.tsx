"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";

interface PollOption {
  id: number;
  text: string;
}

interface Props {
  onSubmit: (options: string[]) => void;
}

const Poll = ({ onSubmit }: Props) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [options, setOptions] = useState<PollOption[]>([
    { id: 1, text: "" },
    { id: 2, text: "" },
    { id: 3, text: "" },
    { id: 4, text: "" },
  ]);

  const addOption = () => {
    if (options.length < 4) {
      const newId = options.length + 1;
      setOptions([...options, { id: newId, text: "" }]);
    }
  };

  const removeOption = (id: number) => {
    const updatedOptions = options.filter((option) => option.id !== id);
    setOptions(updatedOptions);
  };

  const handleOptionChange = (id: number, value: string) => {
    const updatedOptions = options.map((option) =>
      option.id === id ? { ...option, text: value } : option
    );
    setOptions(updatedOptions);
  };

  return (
    <form
      onSubmit={handleSubmit((data) => onSubmit(Object.values(data.options)))}
    >
      {options.map((option) => (
        <div key={option.id} className="mb-2">
          <input
            {...register(`options.${option.id}`, { required: true })}
            type="text"
            value={option.text}
            onChange={(e) => handleOptionChange(option.id, e.target.value)}
            placeholder={`Option ${option.id}`}
            className="border-gray-300 rounded-md p-2 mr-2 focus:outline-none focus:border-blue-500"
          />
          <button
            type="button"
            onClick={() => removeOption(option.id)}
            className="text-red-500 font-medium"
          >
            Remove
          </button>
        </div>
      ))}
      {options.length < 4 && (
        <button
          type="button"
          onClick={addOption}
          className="bg-blue-500 text-white py-2 px-4 rounded-md"
        >
          Add Option
        </button>
      )}
      <button
        type="submit"
        className="bg-green-500 text-white py-2 px-4 rounded-md mt-4"
      >
        Submit Poll
      </button>
      {errors.options && (
        <p className="text-red-500">Please fill all options.</p>
      )}
    </form>
  );
};

export default Poll;
