import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';

export const home = () => {
    const directory = path.resolve(os.homedir(), '.atlassian-devbox');
    fs.mkdirSync(directory, { recursive: true });
    const settingsFile = path.resolve(directory, 'settings.xml');
    if (fs.existsSync(settingsFile)) return directory;

    const settingsContent = `
<settings>
    <profiles>
        <profile>
            <id>atlassian</id>
            <repositories>
                <repository>
                    <id>atlassian-public</id>
                    <url>https://packages.atlassian.com/mvn/maven-external/</url>
                    <snapshots>
                        <enabled>true</enabled>
                        <updatePolicy>never</updatePolicy>
                        <checksumPolicy>warn</checksumPolicy>
                    </snapshots>
                    <releases>
                        <enabled>true</enabled>
                        <checksumPolicy>warn</checksumPolicy>
                    </releases>
                </repository>
            </repositories>
            <pluginRepositories>
                <pluginRepository>
                    <id>atlassian-public</id>
                    <url>https://packages.atlassian.com/mvn/maven-external/</url>
                    <snapshots>
                        <enabled>true</enabled>
                        <updatePolicy>never</updatePolicy>
                        <checksumPolicy>warn</checksumPolicy>
                    </snapshots>
                    <releases>
                        <enabled>true</enabled>
                        <checksumPolicy>warn</checksumPolicy>
                    </releases>
                </pluginRepository>
            </pluginRepositories>
        </profile>
    </profiles>
    <activeProfiles>
        <activeProfile>atlassian</activeProfile>
    </activeProfiles>
</settings>
    `;
    fs.writeFileSync(settingsFile, settingsContent, { encoding: 'utf-8' });
    return directory;
};
