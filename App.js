import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { ImageBackground, TouchableOpacity } from "react-native";
import { TextInput } from "react-native";
import { StyleSheet, Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { GiftedChat } from "react-native-gifted-chat";
import * as Speech from "expo-speech";
import bg from "./assets/bg.jpg";
// import { openaiKey } from "./config/key";
import { OPENAI_API_KEY } from "@env";

export default function App() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [outputMessage, setOutputMessage] = useState("Results to be shwon");

  const handleButtonClick = () => {
    console.log(inputMessage);
    console.log(OPENAI_API_KEY); // Testing api keys
    if (inputMessage.toLocaleLowerCase().startsWith("generate image")) {
      generateImage();
    } else {
      generateText();
    }
  };

  const generateText = () => {
    const message = {
      _id: Math.random().toString(36).substring(7),
      text: inputMessage,
      createdAt: new Date(),
      user: { _id: 1 },
    };
    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, [message])
    );
    fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant.",
          },
          {
            role: "user",
            content: inputMessage,
          },
        ],
        model: "gpt-3.5-turbo-0125",
      }),
    })
      // .then((resp) => resp.json())
      .then((resp) => {
        console.log(resp);

        if (!resp.ok) {
          throw new Error("Failed to fetch data from API");
        }
        return resp.json();
      })
      .then((data) => {
        // console.log(data.choices[0].text);
        // console.log(data);
        setInputMessage("");
        setOutputMessage(data.choices[0].message.content.trim());

        const message = {
          _id: Math.random().toString(36).substring(7),
          text: data.choices[0].message.content.trim(),
          createdAt: new Date(),
          user: { _id: 2, name: "OpenAI" },
        };
        setMessages((previousMessages) =>
          GiftedChat.append(previousMessages, [message])
        );
        options = {};
        Speech.speak(data.choices[0].message.content.trim(), options);
      });
  };

  const generateImage = () => {
    const message = {
      _id: Math.random().toString(36).substring(7),
      text: inputMessage,
      createdAt: new Date(),
      user: { _id: 1 },
    };
    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, [message])
    );
    console.log("Btn clicked");
    fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        prompt: inputMessage,
        n: 2,
        size: "1024x1024",
      }),
    })
      // .then((resp) => resp.json())
      .then((resp) => {
        if (!resp.ok) {
          throw new Error("Failed to fetch image from API");
        }
        return resp.json();
      })
      .then((data) => {
        console.log(data.data[0].url);
        setInputMessage("");
        setOutputMessage(data.data[0].url);

        data.data.forEach((item) => {
          const message = {
            _id: Math.random().toString(36).substring(7),
            text: "Image",
            createdAt: new Date(),
            user: { _id: 2, name: "OpenAI" },
            image: item.url,
          };
          setMessages((previousMessages) =>
            GiftedChat.append(previousMessages, [message])
          );
        });
      });
  };

  const handleTextInput = (text) => {
    setInputMessage(text);
    console.log(text);
  };
  return (
    <ImageBackground
      source={bg}
      resizeMode="cover"
      style={{ flex: 1, width: "100%", height: "100%" }}
    >
      <View style={{ flex: 1 }}>
        <View style={{ flex: 1, justifyContent: "center" }}>
          {/* <Text>{outputMessage}</Text>  */}
          <GiftedChat
            messages={messages}
            renderInputToolbar={() => {}}
            user={{ _id: 1 }}
            minInputToolbarHeight={0}
          />
        </View>

        <View style={{ flexDirection: "row" }}>
          <View style={styles.textInputContainer}>
            <TextInput
              placeholder="Enter Your Question"
              onChangeText={handleTextInput}
              value={inputMessage}
            />
          </View>

          <TouchableOpacity onPress={handleButtonClick}>
            <View style={styles.btn}>
              <MaterialIcons
                name="send"
                size={30}
                color="white"
                style={{ marginLeft: 10 }}
              />
            </View>
          </TouchableOpacity>
        </View>
        <StatusBar style="auto" />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  textInputContainer: {
    flex: 1,
    marginLeft: 10,
    marginBottom: 20,
    backgroundColor: "white",
    borderRadius: 10,
    borderColor: "grey",
    borderWidth: 1,
    height: 60,
    marginLeft: 10,
    marginRight: 10,
    justifyContent: "center",
    paddingLeft: 10,
    paddingRight: 10,
  },
  btn: {
    backgroundColor: "green",
    padding: 5,
    marginRight: 10,
    marginBottom: 20,
    borderRadius: 9999,
    width: 60,
    height: 60,
    justifyContent: "center",
  },
});
