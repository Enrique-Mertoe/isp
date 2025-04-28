class ServerContext:
    """
    Context manager for batching operations to be sent in bulk
    """

    def __init__(self, context_type):
        self.context_type = context_type
        self.in_context = False
        self.operations = []

    def __enter__(self):
        self.in_context = True
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.in_context = False

    def add_operation(self, command: str, parameters: dict):
        """Add an operation to the batch queue"""
        if not self.in_context:
            raise RuntimeError("Cannot add operations outside of context!")

        self.operations.append({
            "command": command,
            "parameters": parameters
        })

    def run_process(self):
        """
        Execute all batched operations and return the results
        """
        if not self.in_context:
            raise RuntimeError("Cannot run process outside of context!")

        if self.context_type == "bulk":
            return {
                "status": "success",
                "operations_count": len(self.operations),
                "bulk_id": id(self)  # Using object id as a simple unique identifier
            }
        else:
            raise ValueError(f"Unsupported context type: {self.context_type}")
