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
                'Cache-Control': 'no-cache'
            },
        });

        if (getResponse.status === 200) {
            const data = await getResponse.json();
            sha = data.sha;
        } else if (getResponse.status !== 404) {
            const errorData = await getResponse.json();
            return {
                success: false,
                message: `GitHub API Error: ${errorData.message || getResponse.statusText}`
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
                content: btoa(unescape(encodeURIComponent(content))), // Proper Base64 for Unicode
                sha,
                branch,
            }),
        });

        if (putResponse.ok) {
            return { success: true, message: "Successfully synced to GitHub!" };
        } else {
            const errorData = await putResponse.json();
            return {
                success: false,
                message: `Sync failed: ${errorData.message || putResponse.statusText}`
            };
        }
    } catch (error) {
        console.error("GitHub Sync Error:", error);
        return { success: false, message: "Connection error. Please check your internet and token." };
    }
};
