const recordBtn = document.querySelector(".record"),
  result = document.querySelector(".result"),
  downloadBtn = document.querySelector(".download"),
  inputLanguage = document.querySelector("#language"),
  clearBtn = document.querySelector(".clear");

let SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition,
  recognition,
  recording = false,
  caretRange = null;

function populateLanguages() {
  languages.forEach((lang) => {
    const option = document.createElement("option");
    option.value = lang.code;
    option.innerHTML = lang.name;
    inputLanguage.appendChild(option);
  });
}

populateLanguages();

function speechToText() {
  try {
    recognition = new SpeechRecognition();
    recognition.lang = inputLanguage.value;
    recognition.interimResults = true;
    recordBtn.classList.add("recording");
    recordBtn.querySelector("p").innerHTML = "Listening...";
    recognition.start();

    recognition.onresult = (event) => {
      const speechResult = event.results[0][0].transcript;

      if (caretRange) {
        const span = document.createElement("span");
        span.textContent = speechResult;
        caretRange.deleteContents();
        caretRange.insertNode(span);
        caretRange = document.createRange();
        caretRange.setStartAfter(span);
        caretRange.setEndAfter(span);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(caretRange);
      } else {
        result.innerHTML += speechResult;
      }

      downloadBtn.disabled = false;
    };

    recognition.onspeechend = () => {
      stopRecording();
    };

    recognition.onerror = (event) => {
      stopRecording();
      handleRecognitionError(event.error);
    };

  } catch (error) {
    recording = false;
    console.log(error);
  }
}

function handleRecognitionError(error) {
  if (error === "no-speech") {
    alert("No speech was detected. Stopping...");
  } else if (error === "audio-capture") {
    alert("No microphone was found. Ensure that a microphone is installed.");
  } else if (error === "not-allowed") {
    alert("Permission to use microphone is blocked.");
  } else if (error === "aborted") {
    alert("Listening Stopped.");
  } else {
    alert("Error occurred in recognition: " + error); // Handle other recognition errors
  }
}

// Record speech button click event listener
recordBtn.addEventListener("click", () => {
  if (!recording) {
    speechToText();
    recording = true;
  } else {
    stopRecording();
  }
});

// Stop recording function
function stopRecording() {
  if (recognition) {
    recognition.stop();
  }
  recordBtn.querySelector("p").innerHTML = "Start Listening";
  recordBtn.classList.remove("recording");
  recording = false;
}

// Save the caret position when the user clicks in the editable div
result.addEventListener("click", () => {
  const sel = window.getSelection();
  if (sel.rangeCount > 0) {
    caretRange = sel.getRangeAt(0);
  }
});

// Download button click event listener
downloadBtn.addEventListener("click", () => {
  const filename = "speech.pdf";
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const textContent = result.innerText.replace(/<br>/g, "\n"); // Replace <br> with newline
  doc.text(textContent, 10, 10);
  doc.save(filename);
});

// Clear button click event listener
clearBtn.addEventListener("click", () => {
  result.innerHTML = "";
  downloadBtn.disabled = true;
});
