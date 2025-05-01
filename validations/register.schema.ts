import { z } from "zod";

const registerSchema = z
  .object({
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    username: z
      .string()
      .min(3, { message: "Username must be at least 3 characters." }),
    email: z.string().email({ message: "Your email is invalid." }),
    mobile_number: z
      .string()
      .min(10, { message: "Mobile number must be at least 10 digits." })
      .max(10, { message: "Mobile number must not exceed 10 digits." })
      .regex(/^[0-9]+$/, {
        message: "Mobile number must contain only digits.",
      }),
    gender: z.string().min(1, { message: "Please select your gender." }),
    country: z.string().min(1, { message: "Please select your country." }),
    state: z.string().min(1, { message: "Please select your state." }),
    city: z.string().min(1, { message: "Please select your city." }),
    address_line_1: z
      .string()
      .min(5, { message: "Address must be at least 5 characters." }),
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters." })
      .regex(/[A-Z]/, {
        message: "Password must contain at least one uppercase letter.",
      })
      .regex(/[a-z]/, {
        message: "Password must contain at least one lowercase letter.",
      })
      .regex(/[0-9]/, { message: "Password must contain at least one number." })
      .regex(/[^A-Za-z0-9]/, {
        message: "Password must contain at least one special character.",
      }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export default registerSchema;
