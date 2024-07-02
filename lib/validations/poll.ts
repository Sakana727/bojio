import * as z from 'zod';

export const PollValidation = z.object({
    question: z.string().min(1, "Question is required"),
    options: z.string().array().min(2, "At least two options are required"),
});

export const PollOptionValidation = z.object({
    selectedOption: z.string().min(1, "You must select an option"),
});