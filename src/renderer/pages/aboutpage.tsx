import { appInfo } from "../../shared/constants/app";
import logo from "../../assets/logo.png";
import type { LauncherCopy } from "../i18n";

type AboutCopy = LauncherCopy["aboutPanel"];

interface AboutPageProps {
  copy: AboutCopy;
}

export function AboutPage({ copy }: AboutPageProps) {
  return (
    <section className="panel about-panel">
      <div className="panel-heading">
        <div className="about-title">
          <img className="about-logo" src={logo} alt="" />
          <div>
            <p className="eyebrow">{copy.eyebrow}</p>
            <h2>{appInfo.name}</h2>
          </div>
        </div>
      </div>
      <dl>
        <div>
          <dt>{copy.author}</dt>
          <dd>{appInfo.author}</dd>
        </div>
        <div>
          <dt>{copy.organization}</dt>
          <dd>{appInfo.organization}</dd>
        </div>
        <div>
          <dt>{copy.website}</dt>
          <dd>
            <a href={appInfo.website} target="_blank" rel="noreferrer">
              {appInfo.website}
            </a>
          </dd>
        </div>
        <div>
          <dt>{copy.license}</dt>
          <dd>{appInfo.license}</dd>
        </div>
      </dl>
      <p className="muted">{appInfo.copyright}</p>
    </section>
  );
}
