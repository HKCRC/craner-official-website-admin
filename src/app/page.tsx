export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <div className="flex flex-row items-center justify-center gap-2">
        <p>Craner HK official site {" -> "}</p>
        <a
          href="https://www.craner.hk"
          target="_blank"
          rel="noopener noreferrer"
        >
          https://www.craner.hk
        </a>
      </div>
      <div className="flex flex-row items-center justify-center gap-2">
        <p>Admin {" -> "}</p>
        <a
          href="https://admin.craner.hk"
          target="_blank"
          rel="noopener noreferrer"
        >
          https://admin.craner.hk
        </a>
      </div>
    </div>
  );
}
