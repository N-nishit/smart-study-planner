const chatToggle =
    document.querySelector("#chat-toggle");

const chatWidget =
    document.querySelector("#chat-widget");

const chatSend =
    document.querySelector("#chat-send");

const chatInput =
    document.querySelector("#chat-input");

const chatMessages =
    document.querySelector("#chat-messages");

chatToggle.addEventListener("click", () => {

    if(chatWidget.style.display === "flex"){

        chatWidget.style.display = "none";

    }

    else{

        chatWidget.style.display = "flex";

    }

});

chatSend.addEventListener("click", async () => {

    const message =
        chatInput.value.trim();

    if(!message){
        return;
    }

    chatMessages.innerHTML +=

        `<p><strong>You:</strong> ${message}</p>`;

    const response =
        await fetch("/chat", {

            method: "POST",

            headers: {

                "Content-Type":
                    "application/json"

            },

            body: JSON.stringify({

                message: message

            })

        });

    const data =
        await response.json();
    let reply = data.reply;

    reply = reply.replace(
        /\*\*(.*?)\*\*/g,
        "<strong>$1</strong>"
    );

    reply = reply.replace(
        /\n/g,
        "<br>"
    );


    chatMessages.innerHTML += `
    <div class="ai-message">
        <strong>Nova:</strong>
        <br>
        ${reply}
    </div>
    `;

    chatInput.value = "";

});