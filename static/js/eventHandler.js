class EventHandler{
    static async compensateUserDevicePixelRatio(){
        const dpr = window.devicePixelRatio;
        const dynamicVH = dpr * 100;

        document.body.style.zoom = `${Math.floor(1 / dpr * 100)}%`;
        document.documentElement.style.setProperty("--GRID-CONTAINER-HEIGHT", dynamicVH + "vh");
    }

    static keyDown(event, isTextModalInputFocused){
        if (isTextModalInputFocused){
            const textModalInput = globalInstancesMap.textModalInput;
            const textModalSubmitButton = globalInstancesMap.textModalSubmitButton;
            
            if (event.key === "Backspace"){
                textModalInput.value = textModalInput.value.slice(0, -1);
            } else if (event.key.length === 1){
                textModalInput.value += event.key;
            } else if (event.key === "Enter"){
                textModalSubmitButton.click();
            }
            event.preventDefault();
        }
    }

    static isTextFieldEvent(event) {
        const target = event.target;
        const tag = (target?.tagName || "").toLowerCase();
        return tag === "input" || tag === "textarea" || target?.isContentEditable;
    }

    static async windowResize(){
        const RESCALE_AFTER_MS = 15;
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(EngineAdapter.resizeBoard, RESCALE_AFTER_MS);
    }

    static setCanvasDimensions(){
        const canvas = globalInstancesMap.canvas;
        const canvasParent = globalInstancesMap.canvasParent;

        canvas.width = canvasParent.clientWidth;
        canvas.height = canvasParent.clientHeight;
    }

   static async loadCadFile(newFileObject){
        CadFileLoader.removePreviousFileFromFS(pyodide, loadedFileName);
        await CadFileLoader.openAndLoadCadFile(pyodide, newFileObject);
        EventHandler.enableButtons();
        
        return newFileObject.name;
    }

    static enableButtons(){
        globalInstancesMap.changeSideButton.disabled = false;
        globalInstancesMap.rotateButton.disabled = false;
        globalInstancesMap.mirrorSideButton.disabled = false;
        globalInstancesMap.toggleOutlinesButton.disabled = false;
        globalInstancesMap.toggleComponentNamesButton.disabled = false;
        globalInstancesMap.resetViewButton.disabled = false;
        globalInstancesMap.areaFromComponentsButton.disabled = false;
        globalInstancesMap.preserveComponentMarkersButton.disabled = false;
        globalInstancesMap.unselectNetButton.disabled = false;
        globalInstancesMap.findComponentUsingNameButton.disabled = false;
        globalInstancesMap.prefixComponentsButton.disabled = false;
        globalInstancesMap.unselectPrefixComponentsButton.disabled = false;
        globalInstancesMap.unselectAllComponentsButton.disabled = false;
    }

    static preserveComponentMarkers(isSelectionModeSingle){
        const allComponentsList = globalInstancesMap.allComponentsList;
        const preserveComponentMarkersButton = globalInstancesMap.preserveComponentMarkersButton;
        const selectionModesMap = {true: "single", false: "multiple"};
    
        isSelectionModeSingle = !isSelectionModeSingle;
        allComponentsList.selectionMode = selectionModesMap[isSelectionModeSingle];
        EventHandler.toggleButton(preserveComponentMarkersButton);
        return isSelectionModeSingle;
    }

    static async toggleComponentNames(){
        const toggleComponentNamesButton = globalInstancesMap.toggleComponentNamesButton;

        await EngineAdapter.toggleComponentNames();
        EventHandler.toggleButton(toggleComponentNamesButton);
    }

    static async unselectNet(){
        await EngineAdapter.unselectNet();
        WidgetAdapter.resetSelectedNet();
    }

    static findComponentUsingName(){
        const modalSubmit = globalInstancesMap.modalSubmit;
        InputModalBoxAdapter.generateModalBox(modalSubmit, "Component name", InputModalBoxAdapter.getComponentNameFromInput);
    }
    
    static showCommonPrefixComponents(){
        const modalSubmit = globalInstancesMap.modalSubmit;
        InputModalBoxAdapter.generateModalBox(modalSubmit, "Common Prefix", InputModalBoxAdapter.getCommonPrefixFromInput);
    }
    
    static async hideCommonPrefixComponents(){
        const commonPrefixSpan = globalInstancesMap.commonPrefixSpan;
        
        await EngineAdapter.hideCommonPrefixComponents();
        commonPrefixSpan.innerText = "";
    }

    static async toggleOutlines(){
        const toggleOutlinesButton = globalInstancesMap.toggleOutlinesButton;

        await EngineAdapter.toggleOutlines();
        EventHandler.toggleButton(toggleOutlinesButton);
    }

    static toggleButton(button){
        if (button.classList.contains("button-selected")){
            button.classList.remove("button-selected");
        } else {
            button.classList.add("button-selected");
        }
    }

    static forcedUntoggleButton(button){
        button.classList.remove("button-selected");
    }

    static showHelpModalBox(){
        const modalHelp = globalInstancesMap.modalHelp;

        modalHelp.setHeader("Better Board Navigator - help");
        SimpleModalAdapter.generateModalBox(modalHelp);
    }

    static loadDemoFile(loadedFileName){
        fetch("./static/cad_files/demo.cad")
            .then(response => response.blob())
            .then(async blob => {
                const demofile = new File([blob], "demo.cad", {type: "application/octet-stream"});
                await EventHandler.loadCadFile(demofile);                   
                
                return "demo.cad";
            }
        );
    }
}