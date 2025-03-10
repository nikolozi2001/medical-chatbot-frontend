# Medical Chatbot Frontend

This project is the frontend for a medical chatbot application. It allows users to ask medical-related questions and receive responses from the chatbot.

## Features

- Ask medical-related questions
- Receive responses from the chatbot
- Responsive modal for input and responses
- Live caller widget integration

## Prerequisites

- Node.js (version 14 or higher)
- npm (version 6 or higher)

## Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/yourusername/medical-chatbot-frontend.git
   ```
2. Navigate to the project directory:
   ```sh
   cd medical-chatbot-frontend
   ```
3. Install dependencies:
   ```sh
   npm install
   ```

## Running the Application

### Important: Start Backend First
For the live chat functionality to work, make sure to start the backend server first:

```bash
# Run the backend server
npm run start:backend
```

### Then Start Frontend
After the backend is running, start the frontend in a new terminal:

```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173` to use the application.

## Troubleshooting

### Connection Errors
If you see Socket.IO connection errors:
1. Make sure the backend server is running with `npm run start:backend`
2. Check that port 8000 is not in use by another application
3. Ensure your firewall is not blocking the connection

### Live Chat Not Working
The live chat feature requires the backend server to be running. If the chat isn't connecting:
1. Run the backend with `npm run start:all`
2. Check the console for error messages
3. Try refreshing the page after the backend is running

## Environment Variables

Create a `.env` file in the root directory and add the following environment variables:

```
GOOGLE_GEN_AI_KEY=your-google-generative-ai-key
VITE_API_URL=http://localhost:8000
```

## Usage

- Enter your question in the input field and click "მკითხე" to get a response.
- Click "გასუფთავება" to clear the chat history.
- Click "კითხვის გენერირება!" to generate a random question.

## Components

### `InputForm`

The `InputForm` component allows users to input their questions and submit them to the chatbot.

### `ResponseDisplay`

The `ResponseDisplay` component displays the chatbot's responses.

### `Modal`

The `Modal` component displays a modal overlay with a transition effect from bottom to top. It is responsive and adjusts its layout based on the screen size.

### `LiveCallerWidget`

The `LiveCallerWidget` component provides live caller functionality within the modal.

## Styles

The styles for the modal are defined in `Modal.scss`. The modal is responsive and adjusts its layout based on the screen size.

## License

This project is licensed under the MIT License.
