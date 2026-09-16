package contracts

// CompensationType is a specific kind of compensation.
const CompensationType = "FILE_BACKUP_V1"

// CompensationDescriptor holds the necessary information to perform a rollback.
type CompensationDescriptor struct {
	DescriptorType    string `json:"descriptor_type"`
	DescriptorVersion string `json:"descriptor_version"`
	BackupRef         string `json:"backup_ref"`
	TargetRef         string `json:"target_ref"`
	BackupHash        string `json:"backup_hash"`
}
