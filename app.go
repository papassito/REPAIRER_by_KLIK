package ui

import (
	"fyne.io/fyne/v2"
	"fyne.io/fyne/v2/app"
	"fyne.io/fyne/v2/container"
)

func LaunchApp() {
	a := app.New()
	w := a.NewWindow("REPAIRER by KLIK")

	dashboard := makeDashboard()
	plans := makePlansView()
	ledger := makeLedgerView()

	tabs := container.NewAppTabs(
		container.NewTabItem("Dashboard", dashboard),
		container.NewTabItem("Plans", plans),
		container.NewTabItem("Ledger", ledger),
	)

	w.SetContent(tabs)
	w.Resize(fyne.NewSize(800, 600))
	w.ShowAndRun()
}
