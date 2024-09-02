

let cachedWords = {};
const saveTemplateAsFile = (filename, dataObjToWrite) => {
  let promise = new Promise((resolve, reject) => {
    const blob = new Blob([JSON.stringify(dataObjToWrite)], {
      type: "text/json",
    });
    const link = document.createElement("a");

    link.download = filename;
    link.href = window.URL.createObjectURL(blob);
    link.dataset.downloadurl = ["text/json", link.download, link.href].join(
      ":"
    );

    const evt = new MouseEvent("click", {
      view: window,
      bubbles: true,
      cancelable: true,
    });

    link.dispatchEvent(evt);
    link.remove();

    resolve("");
  });
  return promise;
};

const returnCorrectLengthOutput = (output: string, inputType: string) => {
  const urlParams = new URLSearchParams(window.location.search);
  let promise = new Promise(async (resolve, reject) => {
    let MAX_CHARACTER_COUNT = returnMaxCharacter(inputType);

    let inputElement = document.querySelector("textarea");
    let currentOutput = output;
    while (currentOutput.length > MAX_CHARACTER_COUNT) {
      let input = "";
      if (inputType == "description") {
        let { descriptionSizeIndex, allSizeDescription } =
          await chrome.storage.local.get([
            "descriptionSizeIndex",
            "allSizeDescription",
          ]);
        descriptionSizeIndex = descriptionSizeIndex + 1;
        input = allSizeDescription[descriptionSizeIndex];
        await chrome.storage.local.set({
          descriptionSizeIndex: descriptionSizeIndex,
        });
      }
      if (inputType == "title") {
        let { titleSizeIndex, allSizeTitle } = await chrome.storage.local.get([
          "titleSizeIndex",
          "allSizeTitle",
        ]);
        titleSizeIndex = titleSizeIndex + 1;
        input = allSizeTitle[titleSizeIndex];
        await chrome.storage.local.set({
          titleSizeIndex: titleSizeIndex,
        });
      }
      if (inputType == "subtitle") {
        let { subtitleSizeIndex, allSizeSubTitle } =
          await chrome.storage.local.get([
            "subtitleSizeIndex",
            "allSizeSubTitle",
          ]);
        subtitleSizeIndex = subtitleSizeIndex + 1;
        input = allSizeSubTitle[subtitleSizeIndex];
        await chrome.storage.local.set({
          subtitleSizeIndex: subtitleSizeIndex,
        });
      }

      inputElement.value = String(input).toLowerCase();
      inputElement.dispatchEvent(new Event("input", { bubbles: true }));
      await new Promise((re, _) => setTimeout(() => re(""), 2000));
      let translationOfCurrentInput = "";
      while (translationOfCurrentInput == "") {
        await new Promise((rs, rj) => setTimeout(() => rs(""), 2000));
        let element = document.querySelector("[jsname='jqKxS']") as HTMLElement;

        if (element) {
          translationOfCurrentInput = element.innerText;
        }
      }

      currentOutput = translationOfCurrentInput;

      if (urlParams.get("tl") != "en") {
        currentOutput = translationOfCurrentInput as string;
      }

      if (currentOutput.length > MAX_CHARACTER_COUNT) {
        saveTemplateAsFile("overflow.json", { output: currentOutput });
      }
    }

    resolve(currentOutput);
  });

  return promise;
};

const returnMaxCharacter = (inputType) => {
  if (inputType == "title") {
    return 200;
  } else if (inputType == "subtitle") {
    return 1200;
  } else if (inputType == "description") {
    return 4000;
  } else if (inputType == "features") {
    return 4000;
  } else if (inputType == "keyword") {
    return 4000;
  }
};

chrome.runtime.onMessage.addListener(async (message) => {
    console.log("mesasage received", message);
    if (window.location.origin.includes("amazon")) {
      if (message.type == "SEND_TO_APPSTORE") {
        let outputJson = message["outputJson"];
        console.log("out put json is", outputJson);
  
        if (Array.isArray(outputJson)) {
          console.log("output json,", outputJson);
          let selectLanguageButton = document.querySelectorAll(
            "button[color=ctrl]"
          )[1] as HTMLElement;
  
          selectLanguageButton.click();
          await new Promise((resolve, reject) =>
            setTimeout(() => resolve(""), 2000)
          );
          let lanList = document.querySelectorAll("li[role=menuitem]");
  
          for (let i = 0; i < lanList.length; i++) {
            let currentItem = lanList
              .item(i)
              .querySelector("button") as HTMLElement;
            console.log("current item si", currentItem.innerText);
            console.log(
              "current item si",
              ["Catalan", "Croatian"].includes(currentItem.innerText)
            );
            // if (!["Catalan", "Croatian"].includes(currentItem.innerText)) {
            //   continue;
            // }
            currentItem.click();
            await new Promise((resolve, reject) =>
              setTimeout(() => resolve(""), 2000)
            );
  
            // let finalDescription = outputJson.find((x) => x.code == "en").output;
            let currentCode = languageCodes.find(
              (x) => x.lan == currentItem.innerText
            );
  
            let currentDescription = currentCode
              ? outputJson.find((x) => x.code == currentCode.code)
              : null;
            if (currentDescription) {
              let { title, subtitle, output } = currentDescription;
  
              let descriptionElement: any =
                document.querySelector("[name=description]");
              let titleElement: any = document.getElementById("name");
              let subtitleElement: any = document.getElementById("subtitle");
              console.log(
                "description element ",
                descriptionElement,
                currentDescription,
                title,
                subtitle
              );
              if (descriptionElement && output) {
                descriptionElement.textContent = output;
  
                descriptionElement.dispatchEvent(
                  new Event("input", { bubbles: true })
                );
              }
              if (titleElement && title) {
                titleElement.value = title;
  
                titleElement.dispatchEvent(new Event("input", { bubbles: true }));
              }
              if (subtitleElement && subtitle) {
                subtitleElement.value = subtitle;
  
                subtitleElement.dispatchEvent(
                  new Event("input", { bubbles: true })
                );
              }
            }
            await new Promise((resolve, reject) =>
              setTimeout(() => resolve(""), 2000)
            );
  
            let headingButtons = document.getElementById("heading-buttons");
            let saveButton = headingButtons.querySelector("button");
            console.log("save button attaera", saveButton.getAttribute("type"));
            // saveButton.click();
  
            console.log("save button clicked");
            await new Promise((resolve, reject) =>
              setTimeout(() => resolve(""), 2000)
            );
  
            let selectLanguageButton = document.querySelectorAll(
              "button[color=ctrl]"
            )[1] as HTMLElement;
  
            selectLanguageButton.click();
            await new Promise((resolve, reject) =>
              setTimeout(() => resolve(""), 2000)
            );
  
            lanList = document.querySelectorAll("li[role=menuitem]");
          }
        }
      }
    }
  });

window.onload = async (event) => {
  console.log("page is fully loaded", window.location.origin);
  if (window.location.origin.includes("translate")) {
    const urlParams = new URLSearchParams(window.location.search);
    cachedWords = {};
    const targetLanguage = urlParams.get("tl");
    let transLationOutput = {
      output: "",
      sourceText: 0,
      sourceTitle: 0,
      title: "",
      subtitle: "",
      sourceSubTitle: 0,
      features: "",
      sourceFeatures: "",
      keywords: "",
      sourceKeywords: "",
    };

    //Description Logic

    let descriptionOutput = "";

    while (descriptionOutput == "") {
      await new Promise((rs, rj) => setTimeout(() => rs(""), 2000));
      let element = document.querySelector("[jsname='jqKxS']") as HTMLElement;
      console.log("finding ", element);
      if (element) {
        descriptionOutput = element.innerText;
      }
    }

    descriptionOutput = (await returnCorrectLengthOutput(
      descriptionOutput,
      "description"
    )) as string;

    let { descriptionSizeIndex } = await chrome.storage.local.get([
      "descriptionSizeIndex",
    ]);
    transLationOutput.sourceText = descriptionSizeIndex;
    transLationOutput.output = descriptionOutput;

    //Title Logic

    let inputElement = document.querySelector("textarea");
    let { title } = await chrome.storage.local.get(["title"]);
    inputElement.value = String(title).toLowerCase();
    inputElement.dispatchEvent(new Event("input", { bubbles: true }));
    await new Promise((re, _) => setTimeout(() => re(""), 2000));
    let titleOutput = "";

    while (titleOutput == "") {
      await new Promise((rs, rj) => setTimeout(() => rs(""), 2000));
      let element = document.querySelector("[jsname='jqKxS']") as HTMLElement;
      console.log("finding ", element);
      if (element) {
        titleOutput = element.innerText;
      }
    }

    titleOutput = (await returnCorrectLengthOutput(
      titleOutput,
      "title"
    )) as string;

    let { titleSizeIndex } = await chrome.storage.local.get(["titleSizeIndex"]);
    transLationOutput.sourceTitle = titleSizeIndex;
    transLationOutput.title = titleOutput;

    //Subtitle Logic

    let { subtitle } = await chrome.storage.local.get(["subtitle"]);
    inputElement.value = String(subtitle).toLowerCase();
    inputElement.dispatchEvent(new Event("input", { bubbles: true }));
    await new Promise((re, _) => setTimeout(() => re(""), 2000));
    let subtitleOutput = "";

    while (subtitleOutput == "") {
      await new Promise((rs, rj) => setTimeout(() => rs(""), 2000));
      let element = document.querySelector("[jsname='jqKxS']") as HTMLElement;
      console.log("finding ", element);
      if (element) {
        subtitleOutput = element.innerText;
      }
    }

    subtitleOutput = (await returnCorrectLengthOutput(
      subtitleOutput,
      "subtitle"
    )) as string;

    let { subtitleSizeIndex } = await chrome.storage.local.get([
      "subtitleSizeIndex",
    ]);
    transLationOutput.sourceSubTitle = subtitleSizeIndex;
    transLationOutput.subtitle = subtitleOutput;

    //Features Logic

    let { features } = await chrome.storage.local.get(["features"]);
    inputElement.value = String(features).toLowerCase();
    inputElement.dispatchEvent(new Event("input", { bubbles: true }));
    await new Promise((re, _) => setTimeout(() => re(""), 2000));
    let featuresOutput = "";

    while (featuresOutput == "") {
      await new Promise((rs, rj) => setTimeout(() => rs(""), 2000));
      let element = document.querySelector("[jsname='jqKxS']") as HTMLElement;
      console.log("finding ", element);
      if (element) {
        featuresOutput = element.innerText;
      }
    }

    featuresOutput = (await returnCorrectLengthOutput(
      featuresOutput,
      "features"
    )) as string;

    let { featureSizeIndex } = await chrome.storage.local.get([
      "featureSizeIndex",
    ]);
    transLationOutput.sourceFeatures = featureSizeIndex;
    transLationOutput.features = featuresOutput;

    //Keywords Logic

    let { keywords } = await chrome.storage.local.get(["keywords"]);
    inputElement.value = String(keywords).toLowerCase();
    inputElement.dispatchEvent(new Event("input", { bubbles: true }));
    await new Promise((re, _) => setTimeout(() => re(""), 2000));
    let keyworsOutput = "";
    while (keyworsOutput == "") {
      await new Promise((rs, rj) => setTimeout(() => rs(""), 2000));
      let element = document.querySelector("[jsname='jqKxS']") as HTMLElement;
      console.log("finding ", element);
      if (element) {
        keyworsOutput = element.innerText;
      }
    }
    keyworsOutput = (await returnCorrectLengthOutput(
      keyworsOutput,
      "keyword"
    )) as string;

    let { keywordSizeIndex } = await chrome.storage.local.get([
      "keywordSizeIndex",
    ]);
    transLationOutput.sourceKeywords = keywordSizeIndex;
    transLationOutput.keywords = keyworsOutput;

    // if (translateOutput.length > MAX_CHARACTER_COUNT) {
    //   let { descriptionSizeIndex, allSizeDescription } =
    //     await chrome.storage.local.get([
    //       "descriptionSizeIndex",
    //       "allSizeDescription",
    //     ]);
    //   descriptionSizeIndex = descriptionSizeIndex + 1;

    //   await chrome.storage.local.set({
    //     description: allSizeDescription[descriptionSizeIndex],
    //     descriptionSizeIndex: descriptionSizeIndex,
    //   });
    //   chrome.runtime.sendMessage({ type: "FROM_POPUP" });
    // }

    chrome.runtime.sendMessage(
      {
        ...transLationOutput,
        targetLanguage,
        type: "SEND_TO_BACKGROUND",
      },
      async (res) => {
        chrome.runtime.sendMessage({ type: "FROM_POPUP" });
      }
    );
  }

  if (window.location.origin.includes("https://www.google.com")) {
    let { outputJson } = await chrome.storage.local.get(["outputJson"]);

    console.log("output json is", outputJson);
    if (outputJson) {
      saveTemplateAsFile("file.json", outputJson);
      await chrome.storage.local.clear();
    }
  }
};
