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


# Data Crawler

The source of disease data in this project comes from data crawling  from popular and trusted health websites, including:

- https://www.alodokter.com/penyakit-a-z
- https://www.halodoc.com/kesehatan
- https://www.ai-care.id/healthpedia/penyakit-a-z

**Note** : the crawler process uses a separate project from this repository, you can see the crawler repository [Here](https://github.com/shodiqimamp/Diagnosa_crawler)

## How It Works :
1. This crawler uses the cheerio library to retrieve disease data in the form of `name`, `definition`, `symptoms`, `causes`, `risk factors`, `diagnosis`, `treatment`, and `prevention`.
2. Data that is successfully crawled will be stored in the disease database which contains :
   ```
   {
     name: 'string',
     description: 'string' 
   }
   ```
   the description column contains a combination of `definition`, `symptoms`, `causes`, `risk factors`, `diagnosis`, `treatment`, and `prevention`.
3. The stored data will be embedded using OpenAIEmbeddings from the langchain library, which is then saved into the database to the embedded model.