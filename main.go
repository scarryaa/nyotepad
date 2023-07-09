package main

import (
	"embed"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/runtime"
	"github.com/wailsapp/wails/v2/pkg/menu"
	"github.com/wailsapp/wails/v2/pkg/menu/keys"

	"io/ioutil"
	"fmt"
	"encoding/base64"
	"encoding/json"
)

//go:embed all:frontend/dist
var assets embed.FS

// File struct
type File struct {
	Path string
	Name string
	Content string
}

func main() {
	// Create an instance of the app structure
	app := NewApp()

	AppMenu := menu.NewMenu()
    FileMenu := AppMenu.AddSubmenu("File")

	FileMenu.AddText("New", keys.CmdOrCtrl("n"), func(_ *menu.CallbackData) {
		println("New")
	})

	FileMenu.AddText("Open", keys.CmdOrCtrl("o"), func(_ *menu.CallbackData) {
		selection, err := runtime.OpenFileDialog(app.ctx, runtime.OpenDialogOptions{
			Title: "Open File",
			Filters: []runtime.FileFilter{
				{
					DisplayName:     "All Files (*.*)",
					Pattern: "*.*",
				},
			},
		})
		if err != nil {
			println("Error:", err.Error())
		}

		// If the user cancelled, selection will be empty
		if selection != "" {
			// Open the file
			println("Opening file:", selection)
			content, err := ioutil.ReadFile(selection)
			if err != nil {
				fmt.Println("Error:", err)
			}
			fmt.Println(string(content))

			// Emit an event
			var eventInfo = append([]interface{}{}, File{
				Name: selection,
				Content: string(content),
			})

			myJson, _ := json.Marshal(eventInfo)

			runtime.EventsEmit(app.ctx, "fileOpen", myJson)
		}
	})

	FileMenu.AddText("Save", keys.CmdOrCtrl("s"), func(_ *menu.CallbackData) {
		// err := ioutil.WriteFile("Untitled.txt", []byte("Hello, World!"), 0644)
	})

	FileMenu.AddText("Save As", keys.CmdOrCtrl("s"), func(_ *menu.CallbackData) {
		runtime.EventsEmit(app.ctx, "saveAs")

		runtime.EventsOnce(app.ctx, "saveAsResponse", func(optionalData ...interface{}) {
			fmt.Println("saveAsResponse")
			fmt.Println(optionalData[0])

			jsonBytes, err := base64.StdEncoding.DecodeString(optionalData[0].(string))
			if err != nil {
				fmt.Println("error:", err)
				return
			}
		
			// JSON decode into File struct
			var files []File
			err = json.Unmarshal(jsonBytes, &files)
			if err != nil {
				fmt.Println("error:", err)
				return
			}
		
			for _, file := range files {
				fmt.Printf("Decoded File: %+v\n", file)
				fmt.Println(file.Name)
				fmt.Println(file.Content)
			}
		})

		selection, err := runtime.SaveFileDialog(app.ctx, runtime.SaveDialogOptions{
			Title: "Save File",
			Filters: []runtime.FileFilter{
				{
					DisplayName:     "All Files (*.*)",
					Pattern: "*.*",
				},
			},
			DefaultFilename: "Untitled.txt",
		})
		if err != nil {
			println("Error:", err.Error())
		}

		// If the user cancelled, selection will be empty
		if selection != "" {
			runtime.EventsEmit(app.ctx, "info", "hello world")
			// Save the file
			println("Saving file:", selection)
			content := []byte("Hello, World!")
			err := ioutil.WriteFile(selection, content, 0644)
			if err != nil {
				fmt.Println("Error:", err)
			}
		}

	})

	FileMenu.AddSeparator()
    FileMenu.AddText("Quit", keys.CmdOrCtrl("q"), func(_ *menu.CallbackData) {
        runtime.Quit(app.ctx)
    })

	// Create application with options
	err := wails.Run(&options.App{
		Title:  "nyotepad",
		Width:  1024,
		Height: 768,
		Menu: AppMenu,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		Debug: options.Debug{
			OpenInspectorOnStartup: true,
		},
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		OnStartup:        app.startup,
		Bind: []interface{}{
			app,
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}
