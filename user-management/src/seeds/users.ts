import { uuidv7 } from "uuidv7";

export const mockUsers = [
    {
        user_key: uuidv7(),
        username: "dandy.divaldy",
        email: "dandy.divaldy@dexa.com",
        department_id: 3,
        first_name: "dandy",
        last_name: "divaldy",
        hire_date: new Date(Date.now())
    },
    {
        user_key: uuidv7(),
        username: "divaldy.dandy",
        email: "divaldy.dandy@dexa.com",
        department_id: 2,
        first_name: "divaldy",
        last_name: "dandy",
        hire_date: new Date(Date.now())
    },
    {
        user_key: uuidv7(),
        username: "divaldy.divaldy",
        email: "divaldy.divaldy@dexa.com",
        department_id: 1,
        first_name: "divaldy",
        last_name: "divaldy",
        hire_date: new Date(Date.now())
    }
]