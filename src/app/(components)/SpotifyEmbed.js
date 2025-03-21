const SpotifyEmbed = ({ spotifyUrl }) => {
    if (!spotifyUrl) return null; // If no URL, return nothing

    const embedUrl = spotifyUrl.replace("https://open.spotify.com/", "https://open.spotify.com/embed/");

    return (
        <iframe
            src={embedUrl}
            width="100%"
            height="80"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
        ></iframe>
    );
};

export default SpotifyEmbed;
