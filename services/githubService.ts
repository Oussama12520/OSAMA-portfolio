/**
 * Service to interact with GitHub API for syncing data
 */

export interface GitHubConfig {
    token: string;
    repo: string; // e.g. "username/repo"
    branch: string;
    path: string; // e.g. "projects.json"
}

export const updateFileOnGithub = async (
    config: GitHubConfig,
    content: string,
    message: string = "Update projects from portfolio admin"
): Promise<{ success: boolean; message: string }> => {
    const { token, repo, branch, path } = config;
    const url = `https://api.github.com/repos/${repo}/contents/${path}`;

    try {
        // 1. Get the current file (to get the SHA) - Use timestamp to prevent caching
        let sha: string | undefined;
        const getResponse = await fetch(`${url}?ref=${branch}&t=${Date.now()}`, {
            headers: {
                Authorization: `token ${token}`,
            },
        });

        if (getResponse.status === 200) {
            const data = await getResponse.json();
            sha = data.sha;
        } else if (getResponse.status === 404) {
            // File doesn't exist yet, that's fine (sha will be undefined)
            console.log("File not found on GitHub, creating new one.");
        } else {
            const errorData = await getResponse.json().catch(() => ({}));
            return {
                success: false,
                message: `GitHub Fetch Error (${getResponse.status}): ${errorData.message || getResponse.statusText}`
            };
        }

        // 2. Push the update
        const putResponse = await fetch(url, {
            method: "PUT",
            headers: {
                Authorization: `token ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                message,
                content: btoa(unescape(encodeURIComponent(content))),
                sha,
                branch,
            }),
        });

        if (putResponse.ok) {
            return { success: true, message: "Successfully synced to GitHub!" };
        } else {
            const errorData = await putResponse.json().catch(() => ({}));
            return {
                success: false,
                message: `GitHub Sync Error (${putResponse.status}): ${errorData.message || putResponse.statusText}`
            };
        }
    } catch (error: any) {
        console.error("GitHub Sync Error:", error);
        return { success: false, message: `System Error: ${error.message || "Unknown connection error"}` };
    }
};
