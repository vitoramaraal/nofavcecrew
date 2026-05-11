function PageTransition({ children }) {
  return (
    <div className="animate-[fadeIn_0.35s_ease-out]">
      {children}
    </div>
  )
}

export default PageTransition