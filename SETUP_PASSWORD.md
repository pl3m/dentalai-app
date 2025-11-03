# Quick Password Setup

## Step 1: Set Your SQL Password

Run this command in your terminal (replace `YourStrongPassword123!` with your actual password):

```bash
azd env set SQL_ADMIN_PASSWORD "YourStrongPassword123!"
```

**That's it!** The password is now stored securely in `.azure/` (which is gitignored).

## Step 2: Verify It's Set

```bash
azd env get-values
```

You should see `SQL_ADMIN_PASSWORD` in the list (but it won't show the actual value for security).

## Step 3: Deploy

Now you can run:

```bash
azd up
```

---

**Note:** You only need to do this once per environment. If you create a new environment with `azd init`, you'll need to set it again.

