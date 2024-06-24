import * as z from "zod";

export const EventValidation = z.object({
    title: z.string().min(1).min(3, { message: "Title must be at least 3 characters." }),
    description: z.string().min(1).min(10, { message: "Description must be at least 10 characters." }),
    date: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid date format",
    }),
    location: z.string().min(1, { message: "Location is required" }),
    image: z.string().optional(),
    communityId: z.string().nullable(),
});

export const CommentValidation = z.object({
    title: z.string().min(1),

});
