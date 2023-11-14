# Note

To use this project with our database you can pull from docker hub <https://hub.docker.com/r/dikaakihira17/gigih-capstone-backend>

You need our database to be able to chat with AI with proper answer because our database have the embedded data

# Feature

-   Register & Login
-   Chat with Health AI Assistant
-   See Chat History

# How To Run

First run in your terminal

```MD
npm install
```

Then create .env file and see `src/@types/environment.d.ts` or `.env.example` to see what's needed in .env file

Then run

```MD
npm run dev
```

to run the program locally with `nodemon`

Import `GIGIH Capstone.postman_collection.json` to your Postman, Insomnia, etc, to see the and how to work with all endpoints

# Endpoints

## Auth

### **POST api/v1/auth/register**

Registering user account

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

-   **Error Response:**
    -   **Code:** 500  
         **Content:** `{ err: <error> }`

### **POST api/v1/auth/login**

User Login

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

    -   **Code**: 202 \
         **Content**:

                             ```TS
                              {
                                   accessToken: <string>,
                                   refreshToken: <string>,
                                   message: "Successfully logged in"
                              }
                             ```

-   **Error Response:**
    -   **Code:** 500  
         **Content:** `{ err: <error> }`

### **POST api/v1/auth/requestPasswordReset**

Request to reset password to server

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

    -   **Code**: 200 \
         **Content**:

                             ```TS
                             {
                                   message: "${CLIENT_URL}/api/v1/passwordReset?token=${resetToken}&id=${user._id}"
                              }
                             ```

-   **Error Response:**
    -   **Code:** 500  
         **Content:** `{ err: <error> }`

### **POST api/v1/auth/resetPassword**

After get the link from requestResetPassword user can do the reset password using this endpoint

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

    -   **Code**: 200 \
         **Content**: { success : true }

-   **Error Response:**
    -   **Code:** 500  
         **Content:** `{ err: <error> }`

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

Chatting with AI system

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
     Content-Type: application/json  
     Authorization: `Bearer <token>`

-   **Success Response:**

    -   **Code:** 200  
         **Headers:**  
         Content-Type: "text/event-stream",  
         Cache-Control: "no-cache",  
         Connection: "keep-alive",  
         Access-Control-Allow-Origin: "\*",

                            **Content:** `<streamed_text>`

-   **Error Response:**
    -   **Code:** 500  
         **Content:** `{ err: <error> }`

### **GET api/v1/chat**

get all conversations/chat history by user email

-   **URL Params**  
     none
-   **Data Params**  
     None
-   **Headers**  
     Content-Type: application/json  
     Authorization: `Bearer <token>`
-   **Success Response:**

    -   **Code:** 200  
         **Content:** `{ conversations: [<memory_object>] }`

-   **Error Response:**
    -   **Code:** 500  
         **Content:** `{ err: <error> }`

### **DELETE api/v1/chat/delete-chat-history**

delete chat history

-   **URL Params**  
     _Required_ `sessionId=[string]`
-   **Data Params**  
     None
-   **Headers**  
     Content-Type: application/json  
     Authorization: `Bearer <token>`
-   **Success Response:**

    -   **Code:** 200  
         **Content:** `{ msg: "Chat Deleted" }`

-   **Error Response:**

    -   **Code:** 404  
         **Content:** `{ err: <error> }`

    -   **Code:** 500  
         **Content:** `{ err: <error> }`

## Crawler

### Data Crawler

The source of disease data in this project comes from data crawling from popular and trusted health websites, including:

-   <https://www.alodokter.com/penyakit-a-z>
-   <https://www.halodoc.com/kesehatan>
-   <https://www.ai-care.id/healthpedia/penyakit-a-z>  
     **Note** : the crawler process uses a separate project from this repository, you can see the crawler repository [Here](https://github.com/shodiqimamp/Diagnosa_crawler)

### How It Works

1. This crawler uses the cheerio library to retrieve disease data in the form of `name`, `definition`, `symptoms`, `causes`, `risk factors`, `diagnosis`, `treatment`, and `prevention`.
2. Data that is successfully crawled will be stored in the disease database which contains :

    ```TS
    {
      name: 'string',
      description: 'string'
    }
    ```

    the description column contains a combination of `definition`, `symptoms`, `causes`, `risk factors`, `diagnosis`, `treatment`, and `prevention`.

3. The stored data will be embedded using OpenAIEmbeddings from the langchain library, which is then saved into the database to the embedded model.
