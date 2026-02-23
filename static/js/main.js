function main(){
    LoadingScreen.showLoadingScreen();
    LoadingScreen.showLoadingDots();

    EventHandler.compensateUserDevicePixelRatio();

    const canvas = document.getElementById("canvas");
    const canvasParent = document.getElementById("item-center");
    const loadFileButton = document.getElementById("load-file-button");
    const loadFileInput = document.getElementById("load-file-input");
    const changeSideButton = document.getElementById("change-side-button");
    const rotateButton = document.getElementById("rotate-button");
    const mirrorSideButton = document.getElementById("mirror-side-button");
    const toggleOutlinesButton = document.getElementById("toggle-outlines-button");
    const resetViewButton = document.getElementById("default-view-button");    
    const areaFromComponentsButton = document.getElementById("components-area-button");
    const clickedComponentContainer = document.getElementById("clicked-components");
    const allComponentsContainer = document.getElementById("scrollable-all-components-list");
    const preserveComponentMarkersButton = document.getElementById("toggle-leave-markers-button");
    const clearMarkersButton = document.getElementById("unselect-components-button");
    const markedComponentsContainer = document.getElementById("scrollable-marked-components-list");
    const pinoutTableContainer = document.getElementById("pinout-table");
    const netTreeviewContainer = document.getElementById("net-treeview");
    const unselectNetButton = document.getElementById("unselect-net-button");
    const currentSideSpan = document.getElementById("current-side-span");
    const findComponentUsingNameButton = document.getElementById("find-component-by-name-button");
    const prefixComponentsButton = document.getElementById("prefix-components-button");
    const unselectPrefixComponentsButton = document.getElementById("unselect-prefix-components-button");
    const commonPrefixSpan = document.getElementById("common-prefix-span");
    const selectedComponentSpan = document.getElementById("selected-component-span");
    const helpButton = document.getElementById("help-button");

    const textModalContainer = document.getElementById("text-modal");
    const textModalCloseSpan = document.getElementById("text-modal-close-span");
    const textModalPromptHeader = document.getElementById("text-modal-header");
    const textModalInput = document.getElementById("text-modal-input");
    const textModalSubmitButton = document.getElementById("text-modal-submit-text");

    const paragraphModalContainer = document.getElementById("paragraph-modal");
    const paragraphModalCloseSpan = document.getElementById("paragraph-modal-close-span");
    const paragraphModalPromptHeader = document.getElementById("paragraph-modal-header");
    const paragraphModalTextParagraph = document.getElementById("paragraph-modal-p");

    const helpModalContainer = document.getElementById("help-modal");
    const helpModalCloseSpan = document.getElementById("help-modal-close-span");
    const helpModalHeader = document.getElementById("help-modal-header");
    const showDemoBoardButton = document.getElementById("show-demo-board-button");
    

    var globalInstancesMap = new GlobalInstancesMap();
    globalInstancesMap.setCanvas(canvas);
    globalInstancesMap.setCanvasParent(canvasParent);
    globalInstancesMap.setSelectedComponentSpan(selectedComponentSpan);
    globalInstancesMap.setCommonPrefixSpan(commonPrefixSpan);
    globalInstancesMap.setCurrentSideSpan(currentSideSpan);
    globalInstancesMap.setToggleOutlinesButton(toggleOutlinesButton);

    var modalSubmit = new ModalSubmit(textModalContainer, textModalCloseSpan, 
                                        textModalPromptHeader, textModalInput, 
                                        textModalSubmitButton);
    globalInstancesMap.setModalSubmit(modalSubmit);
    globalInstancesMap.setTextModalSubmitButton(textModalSubmitButton);
    globalInstancesMap.setTextModalInput(textModalInput);
    

    var modalHelp = new ModalHelp(helpModalContainer, helpModalCloseSpan, helpModalHeader, showDemoBoardButton);
    modalHelp.eventParameter = loadedFileName;
    modalHelp.setButtonEvent(EventHandler.loadDemoFile);
    globalInstancesMap.setModalHelp(modalHelp);
    globalInstancesMap.setShowDemoBoardButton(showDemoBoardButton);

    var allComponentsList = DynamicSelectableListAdapter.initDynamicSelectableList(allComponentsContainer);
    globalInstancesMap.setAllComponentsList(allComponentsList);

    var markedComponentsList = DynamicSelectableListAdapter.initDynamicSelectableList(markedComponentsContainer);
    globalInstancesMap.setMarkedComponentsList(markedComponentsList);

    var pinoutTable = PinoutTableAdapter.initPinoutTable(pinoutTableContainer);
    globalInstancesMap.setPinoutTable(pinoutTable);

    var netsTreeview = TreeViewAdapter.initTreeView(netTreeviewContainer);
    globalInstancesMap.setNetsTreeview(netsTreeview);

    var clickedComponentSpanList = SpanListAdapter.initSpanList(clickedComponentContainer);
    globalInstancesMap.setClickedComponentSpanList(clickedComponentSpanList);

    var sideHandler = new SideHandler();

    
    document.addEventListener("DOMContentLoaded", async () => {
        pinoutTable.generateTable();
        
        pyodide = await loadPyodide();
        await configurePythonPath(pyodide);                      
        await loadPygame(pyodide);            
        await loadLocalModules(pyodide);

        pyodide.canvas.setCanvas2D(canvas);
        EventHandler.setCanvasDimensions();
        
        loadFileButton.disabled = false;
        helpButton.disabled = false;
        
        window.addEventListener("resize", EventHandler.windowResize);

        window.addEventListener("keydown", (event) =>{
            EventHandler.keyDown(event, isTextModalInputFocused);
            
            // allow for text field events
            if (isTextModalInputFocused || EventHandler.isTextFieldEvent(event)){
                return;
            }

            // do not pass keydown event to pygame SDL
            event.stopImmediatePropagation();
        }, true); 

        window.addEventListener("keyup", (event) => {
            // do not pass keydown event to pygame SDL
            event.stopImmediatePropagation();
        }, true);            


        canvas.addEventListener("mousedown", mouseDownEvent);
        canvas.addEventListener("mouseup", mouseUpEvent);       
        canvas.addEventListener("mousemove", mouseMoveEvent);
        canvas.addEventListener("wheel", EngineAdapter.zoomInOut);

        loadFileButton.addEventListener("click", () => {
            loadFileInput.click();
        });
        loadFileInput.addEventListener("change", (event) => {
            loadedFileName = EventHandler.loadFile(event, loadedFileName);
        });

        changeSideButton.addEventListener("click", EngineAdapter.changeSide);
        rotateButton.addEventListener("click", EngineAdapter.rotateBoard);
        mirrorSideButton.addEventListener("click", EngineAdapter.mirrorSide);
        toggleOutlinesButton.addEventListener("click", EventHandler.toggleOutlines);
        resetViewButton.addEventListener("click", EngineAdapter.resetView);
        areaFromComponentsButton.addEventListener("click", EngineAdapter.areaFromComponents);
        preserveComponentMarkersButton.addEventListener("click", () => {
            isSelectionModeSingle = EventHandler.preserveComponentMarkers(isSelectionModeSingle);
        });
        clearMarkersButton.addEventListener("click", EngineAdapter.clearMarkers);
        unselectNetButton.addEventListener("click", EventHandler.unselectNet);            
        findComponentUsingNameButton.addEventListener("click", EventHandler.findComponentUsingName);
        prefixComponentsButton.addEventListener("click", EventHandler.showCommonPrefixComponents);
        unselectPrefixComponentsButton.addEventListener("click", EventHandler.hideCommonPrefixComponents);
        helpButton.addEventListener("click", EventHandler.showHelpModalBox);
        
        textModalInput.addEventListener("focus", () => {
            isTextModalInputFocused = true;
        });
        textModalInput.addEventListener("blur", () => {
            isTextModalInputFocused = false;
        });
    });
}