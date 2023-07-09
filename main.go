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
	"encoding/json"
	"strings"
)

//go:embed all:frontend/dist
var assets embed.FS

// File struct
type File struct {
	Path string
	Name string
	Content string
}

func setUpMenu(app *App) *menu.Menu {
	AppMenu := menu.NewMenu()

	// File Menu
	FileMenu := AppMenu.AddSubmenu("File")

	FileMenu.AddText("New", keys.CmdOrCtrl("n"), func(_ *menu.CallbackData) {
		// Emit an event
		runtime.EventsEmit(app.ctx, "new")
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
				Path: selection,
				Name: selection,
				Content: string(content),
			})

			myJson, _ := json.Marshal(eventInfo)

			runtime.EventsEmit(app.ctx, "fileOpen", myJson)
		}
	})

	FileMenu.AddSeparator()

	FileMenu.AddText("Save", keys.CmdOrCtrl("s"), func(_ *menu.CallbackData) {
		// Create a channel to communicate the response
		responseCh := make(chan []File, 1)

		runtime.EventsOnce(app.ctx, "saveResponse", func(optionalData ...interface{}) {
			files := processSaveAsResponse(optionalData...)
			responseCh <- files 
		})

		runtime.EventsEmit(app.ctx, "save")

		// Wait for the response
		files := <-responseCh

		if len(files) > 0 {
			// get first file from the response
			file := files[0]

			// if path is empty, use save as
			if file.Path == "" {
				selection, err := runtime.SaveFileDialog(app.ctx, runtime.SaveDialogOptions{
					Title: "Save File",
					Filters: []runtime.FileFilter{
						{
							DisplayName: "All Files (*.*)",
							Pattern: "*.*",
						},
					},
					DefaultFilename: file.Name, // use file name from the response
					// split the last '/' and use the first part as the default directory, if path is not empty
					DefaultDirectory: strings.Join(strings.Split(file.Path, "/")[:len(strings.Split(file.Path, "/"))-1], "/"),
				})
				if err != nil {
					println("Error:", err.Error())
				}
		
				// If the user cancelled, selection will be empty
				if selection != "" {
					// Save the file
					println("Saving file:", selection)
					content := []byte(file.Content) // use file content from the response
					err := ioutil.WriteFile(selection, content, 0644)
					if err != nil {
						fmt.Println("Error:", err)
					} else {
						fmt.Println("File saved successfully")
					}
				}
			} else {
				// Save the file
				println("Saving file:", file.Path)
				content := []byte(file.Content) // use file content from the response
				err := ioutil.WriteFile(file.Path, content, 0644)
				if err != nil {
					fmt.Println("Error:", err)
				} else {
					fmt.Println("File saved successfully")
				}
			}
		}
	})


	FileMenu.AddText("Save As", keys.CmdOrCtrl("s"), func(_ *menu.CallbackData) {
		// Create a channel to communicate the response
		responseCh := make(chan []File, 1)
	
		runtime.EventsOnce(app.ctx, "saveAsResponse", func(optionalData ...interface{}) {
			files := processSaveAsResponse(optionalData...)
			responseCh <- files 
		})
	
		runtime.EventsEmit(app.ctx, "saveAs")

		// Wait for the response
		files := <-responseCh
	
		if len(files) > 0 {
			// get first file from the response
			file := files[0]
			selection, err := runtime.SaveFileDialog(app.ctx, runtime.SaveDialogOptions{
				Title: "Save File",
				Filters: []runtime.FileFilter{
					{
						DisplayName: "All Files (*.*)",
						Pattern: "*.*",
					},
				},
				DefaultFilename: file.Name, // use file name from the response
				// split the last '/' and use the first part as the default directory, if path is not empty
				DefaultDirectory: strings.Join(strings.Split(file.Path, "/")[:len(strings.Split(file.Path, "/"))-1], "/"),
			})
			if err != nil {
				println("Error:", err.Error())
			}
	
			// If the user cancelled, selection will be empty
			if selection != "" {
				// Save the file
				println("Saving file:", selection)
				content := []byte(file.Content) // use file content from the response
				err := ioutil.WriteFile(selection, content, 0644)
				if err != nil {
					fmt.Println("Error:", err)
				} else {
					fmt.Println("File saved successfully")

					var fileInfo = append([]interface{}{}, File{
						// get file path or if saving over an existing file, use the path from the response
						Path: selection,
						Name: strings.Split(selection, "/")[len(strings.Split(selection, "/"))-1],
						Content: string(content),
					})

					jsonFileInfo, _ := json.Marshal(fileInfo)

					// pass the filename to the frontend
					runtime.EventsEmit(app.ctx, "fileSaved", jsonFileInfo)
				}
			}
		}
	})

	FileMenu.AddSeparator()

	FileMenu.AddText("Close", keys.CmdOrCtrl("w"), func(_ *menu.CallbackData) {
		runtime.EventsEmit(app.ctx, "close")
	})

	FileMenu.AddSeparator()

    FileMenu.AddText("Quit", keys.CmdOrCtrl("q"), func(_ *menu.CallbackData) {
        runtime.Quit(app.ctx)
    })

	// End File Menu

	// Edit Menu

	EditMenu := AppMenu.AddSubmenu("Edit")

	EditMenu.AddText("Undo", keys.CmdOrCtrl("z"), func(_ *menu.CallbackData) {
		runtime.EventsEmit(app.ctx, "undo")
	})

	EditMenu.AddText("Redo", keys.CmdOrCtrl("y"), func(_ *menu.CallbackData) {
		runtime.EventsEmit(app.ctx, "redo")
	})

	EditMenu.AddSeparator()

	EditMenu.AddText("Cut", keys.CmdOrCtrl("x"), func(_ *menu.CallbackData) {
		runtime.EventsEmit(app.ctx, "cut")
	})

	EditMenu.AddText("Copy", keys.CmdOrCtrl("c"), func(_ *menu.CallbackData) {
		runtime.EventsEmit(app.ctx, "copy")
	})

	EditMenu.AddText("Paste", keys.CmdOrCtrl("v"), func(_ *menu.CallbackData) {
		runtime.EventsEmit(app.ctx, "paste")
	})

	EditMenu.AddText("Select All", keys.CmdOrCtrl("a"), func(_ *menu.CallbackData) {
		runtime.EventsEmit(app.ctx, "selectAll")
	})

	// End Edit Menu

	// Help Menu

	HelpMenu := AppMenu.AddSubmenu("Help")

	HelpMenu.AddText("About", keys.CmdOrCtrl("h"), func(_ *menu.CallbackData) {
		runtime.EventsEmit(app.ctx, "about")
	})

	// End Help Menu

	return AppMenu
}

func main() {
	// Create an instance of the app structure
	app := NewApp()
	AppMenu := setUpMenu(app)

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

func processSaveAsResponse(optionalData ...interface{}) []File {
	fmt.Println("saveAsResponse")
	fmt.Println(optionalData[0])

	// Convert to JSON
	jsonBytes, err := json.Marshal(optionalData[0])
	if err != nil {
		fmt.Println("error:", err)
		return nil
	}
	
	// JSON decode into File struct
	var files []File
	err = json.Unmarshal(jsonBytes, &files)
	if err != nil {
		fmt.Println("error:", err)
		return nil
	}

	for _, file := range files {
		fmt.Printf("Decoded File: %+v\n", file)
		fmt.Println(file.Name)
		fmt.Println(file.Content)
	}
	return files
}

