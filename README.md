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

## Auth

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
    -   **Code**: 201 \
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

## Conversation

-   Memory Object

```TS
IMessageSchema {
 type: string;
 data: object;
}

IMemorySchema {
 userId: mongoose.Schema.Types.ObjectId;
 email: string;
 messages: IMessageSchema[];
}
```

### **GET api/v1/chat/initialize**

initialize memory for conversation

-   **URL Params**  
     None
-   **Data Params**  
     None
-   **Headers**  
     Content-Type: application/json  
     Authorization: `Bearer <token>`
-   **Success Response:**

    -   **Code:** 200  
         **Content:** `{ sessionId: <session_id> }`

-   **Error Response:**
    -   **Code:** 500  
         **Content:** `{ err: <error> }`

### **GET api/v1/chat/get-conversation**

get conversation history by memoryId

-   **URL Params**  
     _Required_ `sessionId=[string]`
-   **Data Params**  
     None
-   **Headers**  
     Content-Type: application/json  
     Authorization: `Bearer <token>`
-   **Success Response:**

    -   **Code:** 200  
         **Content:** `{ conversationHistory: <memory_object> }`

-   **Error Response:**
    -   **Code:** 500  
         **Content:** `{ err: <error> }`

### **POST api/v1/chat/conversation**

talking with AI system

-   **URL Params**  
     none
-   **Data Params**

    ```TS
    {
       sessionId: string,
       input: string
    }
    ```

-   **Headers**

    ```TS
    Content-Type: "text/event-stream",
    Cache-Control: "no-cache",
    Connection: "keep-alive",
    Access-Control-Allow-Origin: "*",
    Authorization: `Bearer <token>`
    ```

-   **Success Response:**

    -   **Code:** 200  
         **Content:** `<streamed_text>`

-   **Error Response:**
    -   **Code:** 500  
         **Content:** `{ err: <error> }`
