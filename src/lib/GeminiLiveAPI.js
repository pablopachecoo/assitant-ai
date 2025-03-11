// lib/GeminiLiveAPI.js
class GeminiLiveResponseMessage {
    constructor(data) {
      this.data = "";
      this.type = "";
      this.endOfTurn = data?.serverContent?.turnComplete;
  
      const parts = data?.serverContent?.modelTurn?.parts;
  
      if (data?.setupComplete) {
        this.type = "SETUP COMPLETE";
      } else if (parts?.length && parts[0].text) {
        this.data = parts[0].text;
        this.type = "TEXT";
      } else if (parts?.length && parts[0].inlineData) {
        this.data = parts[0].inlineData.data;
        this.type = "AUDIO";
      }
    }
  }
  
  export class GeminiLiveAPI {
    constructor(proxyUrl, projectId, model, apiHost) {
      this.proxyUrl = proxyUrl;
      this.projectId = projectId;
      this.model = model;
      this.modelUri = `projects/${this.projectId}/locations/us-central1/publishers/google/models/${this.model}`;
  
      this.responseModalities = ["AUDIO"];
      this.systemInstructions = "";
  
      this.apiHost = apiHost;
      this.serviceUrl = `wss://${this.apiHost}/ws/google.cloud.aiplatform.v1beta1.LlmBidiService/BidiGenerateContent`;
  
      this.onReceiveResponse = (message) => {
        console.log("Default message received callback", message);
      };
  
      this.onConnectionStarted = () => {
        console.log("Default onConnectionStarted");
      };
  
      this.onErrorMessage = (message) => {
        console.error("API error:", message);
      };
  
      this.accessToken = "";
      this.webSocket = null;
  
      console.log("Created Gemini Live API object");
    }
  
    setProjectId(projectId) {
      this.projectId = projectId;
      this.modelUri = `projects/${this.projectId}/locations/us-central1/publishers/google/models/${this.model}`;
    }
  
    setAccessToken(newAccessToken) {
      this.accessToken = newAccessToken;
    }
  
    connect(accessToken) {
      if (typeof window === 'undefined') return;
      
      this.setAccessToken(accessToken);
      this.setupWebSocketToService();
    }
  
    disconnect() {
      if (this.webSocket) {
        this.webSocket.close();
        this.webSocket = null;
      }
    }
  
    sendMessage(message) {
      if (this.webSocket && this.webSocket.readyState === WebSocket.OPEN) {
        this.webSocket.send(JSON.stringify(message));
      } else {
        console.error("WebSocket is not open. Cannot send message.");
      }
    }
  
    onReceiveMessage(messageEvent) {
      try {
        const messageData = JSON.parse(messageEvent.data);
        const message = new GeminiLiveResponseMessage(messageData);
        this.onReceiveResponse(message);
      } catch (error) {
        console.error("Error processing received message:", error);
      }
    }
  
    setupWebSocketToService() {
      if (typeof window === 'undefined') return;
      
      console.log("Connecting to Gemini Live API:", this.proxyUrl);
  
      try {
        this.webSocket = new WebSocket(this.proxyUrl);
  
        this.webSocket.onclose = (event) => {
          console.log("WebSocket closed:", event);
          this.onErrorMessage("Connection closed");
        };
  
        this.webSocket.onerror = (event) => {
          console.log("WebSocket error:", event);
          this.onErrorMessage("Connection error");
        };
  
        this.webSocket.onopen = (event) => {
          console.log("WebSocket open:", event);
          this.sendInitialSetupMessages();
          this.onConnectionStarted();
        };
  
        this.webSocket.onmessage = this.onReceiveMessage.bind(this);
      } catch (error) {
        console.error("Error setting up WebSocket:", error);
        this.onErrorMessage("Failed to connect: " + error.message);
      }
    }
  
    sendInitialSetupMessages() {
      const serviceSetupMessage = {
        bearer_token: this.accessToken,
        service_url: this.serviceUrl,
      };
      this.sendMessage(serviceSetupMessage);
  
      const sessionSetupMessage = {
        setup: {
          model: this.modelUri,
          generation_config: {
            response_modalities: this.responseModalities,
          },
          system_instruction: {
            parts: [{ text: this.systemInstructions }],
          },
        },
      };
      this.sendMessage(sessionSetupMessage);
    }
  
    sendTextMessage(text) {
      const textMessage = {
        client_content: {
          turns: [
            {
              role: "user",
              parts: [{ text: text }],
            },
          ],
          turn_complete: true,
        },
      };
      this.sendMessage(textMessage);
    }
  
    sendRealtimeInputMessage(data, mime_type) {
      const message = {
        realtime_input: {
          media_chunks: [
            {
              mime_type: mime_type,
              data: data,
            },
          ],
        },
      };
      this.sendMessage(message);
    }
  
    sendAudioMessage(base64PCM) {
      this.sendRealtimeInputMessage(base64PCM, "audio/pcm");
    }
  
    sendImageMessage(base64Image, mime_type = "image/jpeg") {
      this.sendRealtimeInputMessage(base64Image, mime_type);
    }
  }
  
  export default GeminiLiveAPI;