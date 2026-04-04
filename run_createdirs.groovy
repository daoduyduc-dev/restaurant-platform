@Grab('commons-io:commons-io:2.11.0')

import java.io.File

def runCommand(String cmd) {
    println("Executing: $cmd")
    def process = cmd.execute()
    process.consumeProcessOutput(System.out, System.err)
    process.waitFor()
    return process.exitValue()
}

// Change to the target directory
System.setProperty("user.dir", "D:\\restaurant-platform")

println("=" * 60)
println("Compiling CreateDirs.java...")
println("=" * 60)

int exitCode = runCommand("javac CreateDirs.java")
if (exitCode != 0) {
    println("Compilation failed!")
    System.exit(1)
}

println("\n" + "=" * 60)
println("Running CreateDirs...")
println("=" * 60 + "\n")

exitCode = runCommand("java CreateDirs")

println("\n" + "=" * 60)
println("Execution Complete")
println("=" * 60)
