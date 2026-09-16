package catalog

// AllowedOperations acts as a strict whitelist for all executable operation IDs.
// If an operation is not in this map, the engine will refuse to execute it,
// preventing the execution of arbitrary or unknown operations.
var AllowedOperations = map[string]bool{
	"file.observe": true,
	"file.clean":   true,
}
