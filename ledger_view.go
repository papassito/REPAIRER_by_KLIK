package ui

import (
	"fyne.io/fyne/v2"
	"fyne.io/fyne/v2/container"
	"fyne.io/fyne/v2/widget"
)

func makeLedgerView() fyne.CanvasObject {
	// In a real app, this data would be loaded from the ledger file.
	data := [][]string{
		{"rec-op-001-observe-1700000000", "file.observe", "SUCCEEDED_VERIFIED"},
		{"rec-op-002-clean-1700000001", "file.clean", "SUCCEEDED_VERIFIED"},
	}

	list := widget.NewTable(
		func() (int, int) {
			return len(data), len(data[0])
		},
		func() fyne.CanvasObject {
			return widget.NewLabel("wide content")
		},
		func(i widget.TableCellID, o fyne.CanvasObject) {
			o.(*widget.NewLabel).SetText(data[i.Row][i.Col])
		},
	)

	list.SetColumnWidth(0, 250)
	list.SetColumnWidth(1, 150)
	list.SetColumnWidth(2, 200)

	return container.NewBorder(widget.NewLabelWithStyle("Ledger Records", fyne.TextAlignCenter, fyne.TextStyle{Bold: true}), nil, nil, nil, list)
}
