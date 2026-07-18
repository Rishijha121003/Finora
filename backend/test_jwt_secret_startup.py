import os
import sys
import subprocess

def test_startup():
    print("==================================================")
    print(" TESTING MANDATORY JWT_SECRET STARTUP BEHAVIOR   ")
    print("==================================================\n")

    # Case 1: Start python script with JWT_SECRET configured
    print("--- Case 1: Testing startup WITH JWT_SECRET configured ---")
    env_with_secret = os.environ.copy()
    env_with_secret["JWT_SECRET"] = "test_valid_random_secret_key_12345"
    
    code = "from app.config import settings; print('CONFIG LOADED SUCCESS:', settings.PROJECT_NAME)"
    proc = subprocess.run(
        [sys.executable, "-c", code],
        cwd="/home/rishi/Documents/project1/backend",
        env=env_with_secret,
        capture_output=True,
        text=True
    )
    print("Returncode:", proc.returncode)
    print("Output:", proc.stdout.strip())
    assert proc.returncode == 0
    assert "CONFIG LOADED SUCCESS" in proc.stdout
    print("PASSED: App starts successfully when JWT_SECRET is configured! ✅\n")

    # Case 2: Start python script WITHOUT JWT_SECRET (and without .env file)
    print("--- Case 2: Testing startup WITHOUT JWT_SECRET configured ---")
    env_no_secret = {k: v for k, v in os.environ.copy().items() if k != "JWT_SECRET"}
    
    # Hide local .env temporarily for Case 2 test
    env_file = "/home/rishi/Documents/project1/backend/.env"
    env_bak = "/home/rishi/Documents/project1/backend/.env.test_bak"
    if os.path.exists(env_file):
        os.rename(env_file, env_bak)

    try:
        proc_fail = subprocess.run(
            [sys.executable, "-c", code],
            cwd="/home/rishi/Documents/project1/backend",
            env=env_no_secret,
            capture_output=True,
            text=True
        )
        print("Returncode (expected non-zero):", proc_fail.returncode)
        print("Stderr snippet:", proc_fail.stderr.strip().split("\n")[-1])
        assert proc_fail.returncode != 0
        assert "FATAL STARTUP ERROR: Mandatory environment variable 'JWT_SECRET' is missing" in proc_fail.stderr
        print("PASSED: App fails clearly at startup when JWT_SECRET is missing! ✅\n")
    finally:
        if os.path.exists(env_bak):
            os.rename(env_bak, env_file)

    print("==================================================")
    print(" BOTH JWT_SECRET STARTUP TEST CASES PASSED! 🎉    ")
    print("==================================================")

if __name__ == "__main__":
    test_startup()
