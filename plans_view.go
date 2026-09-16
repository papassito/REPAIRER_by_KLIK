package ui

import (
	"log"

	"fyne.io/fyne/v2"
	"fyne.io/fyne/v2/container"
	"fyne.io/fyne/v2/widget"
)

func makePlansView() fyne.CanvasObject {
	// In a real app, this would be a list of plans.
	planLabel := widget.NewLabel("Plan: plan-019a-win-hosts-observe-clean")
	op1 := widget.NewLabel("Operation: file.observe (READ_ONLY)")
	op2 := widget.NewLabel("Operation: file.clean (REVERSIBLE)")

	executeButton := widget.NewButton("Approve and Execute", func() {
		log.Println("Execute button tapped")
		// Here you would trigger the engine.ExecutePlan function.
	})

	return container.NewVBox(
		widget.NewLabelWithStyle("Maintenance Plans", fyne.TextAlignCenter, fyne.TextStyle{Bold: true}),
		widget.NewCard("Pending Plan", "", container.NewVBox(
			planLabel,
			op1,
			op2,
			executeButton,
		)),
	)
}
