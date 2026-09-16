package ui

import (
	"fyne.io/fyne/v2"
	"fyne.io/fyne/v2/container"
	"fyne.io/fyne/v2/widget"
)

func makeDashboard() fyne.CanvasObject {
	return container.NewVBox(
		widget.NewLabelWithStyle("System Status", fyne.TextAlignCenter, fyne.TextStyle{Bold: true}),
		widget.NewLabel("Last Plan Executed: plan-019a-win-hosts-observe-clean"),
		widget.NewLabel("Ledger Status: Verified"),
		widget.NewLabel("Active Signing Key: 0xABC...DEF"),
	)
}
