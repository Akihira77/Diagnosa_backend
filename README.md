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

-   **Success Response:**  
     * __Code__: 201 \
       **Content**: { message: "Successfully created user" }

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

-   **Success Response:**  
     * __Code__: 202 \
       **Content**: { message: "Successfully logged in" }

### **POST api/v1/auth/requestPasswordReset**

-   **URL Params**  
     None
-   **Data Params**

    ```TS
    {
       email : string
    }
    ```

-   **Headers**  
     Content-Type: application/json

-   **Success Response:**  
     * __Code__: 200 \
       **Content**: { message: "${CLIENT_URL}/api/v1/passwordReset?token=${resetToken}&id=${user._id}" }

### **POST api/v1/auth/resetPassword**

-   **URL Params**  
     None
-   **Data Params**

    ```TS
    {
       userId : string,
       token  : string,
       password : string,
       confirmPassword : string
    }
    ```

-   **Headers**  
     Content-Type: application/json

-   **Success Response:**  
     * __Code__: 200 \
       **Content**: { success : true }
