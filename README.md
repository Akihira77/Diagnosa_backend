# How To Run

first run in your terminal

```MD
npm install
```

then create .env file and see `src/@types/environment.d.ts` to see what's needed in .env file

then you can run

```MD
npm run dev
```

to run the program locally with `nodemon`

# Endpoints

### **POST api/v1/auth/register**

-   **URL Params**  
     None
-   **Data Params**

    ```TS
    {
       email : string,
       password: string,
       confirmPassword: string
    }
    ```

-   **Headers**  
     Content-Type: application/json

### **POST api/v1/auth/login**

-   **URL Params**  
     None
-   **Data Params**

    ```TS
    {
       email : string,
       password: string,
    }
    ```

-   **Headers**  
     Content-Type: application/json
